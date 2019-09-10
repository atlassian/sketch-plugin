import sketch from 'sketch';
import supplyData from '../supplyData';
import { randomChoice } from '../../../util/random';
import pageData from '../../../../../assets/data/confluence/pages.json';

const { DataSupplier } = sketch;

const TEXT_CONFLUENCE_PAGE_TITLE = 'Confluence_Page Title';
const TEXT_CONFLUENCE_PAGE_BODY = 'Confluence_Page Body';
const MULTI_CONFLUENCE_PAGE = 'Confluence_Page';

const getConfluencePageTitle = () => ({
  primary: randomChoice(pageData.titles),
});
const getConfluencePage = () => randomChoice(pageData.linked);

export const onStartup = () => {
  DataSupplier.registerDataSupplier(
    'public.text',
    TEXT_CONFLUENCE_PAGE_TITLE,
    'SupplyConfluencePageTitle',
  );
  DataSupplier.registerDataSupplier(
    'public.text',
    TEXT_CONFLUENCE_PAGE_BODY,
    'SupplyConfluencePageBody',
  );
  DataSupplier.registerDataSupplier(
    'public.text',
    `${MULTI_CONFLUENCE_PAGE} 🔗`,
    'SupplyConfluencePageText',
  );
};

export const onSupplyConfluencePageTitle = context =>
  supplyData(getConfluencePageTitle, context, TEXT_CONFLUENCE_PAGE_TITLE);
export const onSupplyConfluencePageBody = context =>
  supplyData(getConfluencePage, context, TEXT_CONFLUENCE_PAGE_BODY, 'body');
export const onSupplyConfluencePageText = context =>
  supplyData(getConfluencePage, context, MULTI_CONFLUENCE_PAGE, 'title', true);
