import Document from 'sketch/dom';
import UI from 'sketch/ui';
import BrowserWindow from 'sketch-module-web-view';
import event, {
  CATEGORY_OPEN,
  LABEL_PLUGIN,
  CATEGORY_SYMBOL_PALETTE,
  CATEGORY_SYMBOL_PALETTE_EMPTY,
  CATEGORY_LIBRARY,
} from '../../util/analytics/analytics';
import symbols from '../../../../assets/symbol-palette/symbols.json';

const index =
  process.env.NODE_ENV === 'development'
    ? require('../../../webview/symbol-palette/index-devtools.html')
    : require('../../../webview/symbol-palette/index.html');

const { Library } = Document;

const getSymbolReference = ({ libraryName, symbolName }) =>
  Library.getLibraries()
    .find(({ name }) => name === libraryName)
    .getImportableSymbolReferencesForDocument(Document.getSelectedDocument())
    .find(({ name }) => name === symbolName).sketchObject;

const hideWindow = async browserWindow => {
  browserWindow.hide();
  await browserWindow.webContents.executeJavaScript('window.controller.setIsFocused(false)');
};

const moveToActiveWindow = async browserWindow => {
  const mainScreenRect = NSScreen.mainScreen().visibleFrame();
  const x = mainScreenRect.origin.x + Math.round((NSWidth(mainScreenRect) - 680) / 2);
  const y = mainScreenRect.origin.y + Math.round((NSHeight(mainScreenRect) - 448) / 2);
  await browserWindow._panel.setFrameOrigin(NSMakePoint(x, y));
};

const showWindow = async browserWindow => {
  // before showing the window, reset it, move it to the current screen, and set the UI theme

  await Promise.all([
    moveToActiveWindow(browserWindow),
    browserWindow.setVibrancy(UI.getTheme() === 'dark' ? 'ultra-dark' : 'medium-light'),
    browserWindow.webContents.executeJavaScript(
      `window.controller.setSketchTheme('${UI.getTheme()}')`,
    ),
    browserWindow.webContents.executeJavaScript('window.controller.reset()'),
  ]);
  browserWindow.show();
};

export const onStartup = async context => {
  const browserWindow = new BrowserWindow({
    frame: false,
    width: 680,
    height: 448,
    show: false,
    vibrancy: 'medium-light',
    closable: false,
    resizable: false,
    movable: false,
    webPreferences: {
      devTools: process.env.NODE_ENV === 'development',
    },
  });

  // always move the window to the active full-screen space

  browserWindow._panel.setCollectionBehavior(NSWindowCollectionBehaviorMoveToActiveSpace);

  // setup event listeners

  browserWindow.on('blur', () => {
    hideWindow(browserWindow);
  });
  browserWindow.on('focus', async () => {
    await browserWindow.webContents.executeJavaScript('window.controller.setIsFocused(true)');
  });

  browserWindow.webContents.on('resize', newHeight => {
    const { y, height } = browserWindow.getBounds();
    const clampedHeight = Math.min(newHeight, 448);
    if (clampedHeight !== height) {
      browserWindow.setBounds({
        y: y - (height - clampedHeight),
        height: clampedHeight,
      });
    }
  });
  browserWindow.webContents.on('insert', symbol => {
    browserWindow.hide();
    const symbolReference = getSymbolReference(symbol);
    const insertAction = Document.getSelectedDocument()
      .sketchObject.actionsController()
      .actionForID('MSInsertSymbolAction');
    const menuItem = NSMenuItem.alloc().init();
    menuItem.setRepresentedObject([symbolReference]);
    insertAction.doPerformAction(menuItem);

    event(context, CATEGORY_SYMBOL_PALETTE, symbol.name, LABEL_PLUGIN);
    event(context, CATEGORY_LIBRARY, symbol.libraryName);
  });
  browserWindow.webContents.on('did-finish-load', async () => {
    await browserWindow.webContents.executeJavaScript(
      `window.controller.setSymbols(\`${JSON.stringify(symbols)}\`)`,
    );
  });
  browserWindow.webContents.on('close', async () => {
    await hideWindow(browserWindow);
  });
  browserWindow.webContents.on('analyticsEventEmpty', async action => {
    await event(context, CATEGORY_SYMBOL_PALETTE_EMPTY, action, LABEL_PLUGIN);
  });
  browserWindow.webContents.on('analyticsEventMisc', async action => {
    await event(context, null, `Symbol Palette / ${action}`, LABEL_PLUGIN);
  });

  // save reference and load
  // remember to load with devtools if we're on prerelease

  NSThread.mainThread().threadDictionary().browserWindow = browserWindow;

  browserWindow.loadURL(index);
};

export default context => {
  const { browserWindow } = NSThread.mainThread().threadDictionary();
  if (browserWindow) {
    if (browserWindow.isFocused()) {
      hideWindow(browserWindow);
    } else {
      showWindow(browserWindow);
      event(context, CATEGORY_OPEN, 'Symbol Palette', LABEL_PLUGIN);
    }
  }
};
