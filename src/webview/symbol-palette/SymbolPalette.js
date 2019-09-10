import React, { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import styled from '@emotion/styled';
import Fuse from 'fuse.js';
import WindowFocusContext from './context/WindowFocusContext';
import useHeight from './hooks/useHeight';
import SearchBar from './components/SearchBar';
import SymbolList from './components/SymbolList';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Direction = {
  UP: 'up',
  DOWN: 'down',
};

const Navigation = {
  KEYBOARD: 'keyboard',
  MOUSE: 'mouse',
};

const rowSearch = new Fuse([], {
  shouldSort: true,
  location: 0,
  threshold: 0.1,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ['name'],
});

const SymbolPalette = () => {
  const isFocused = useContext(WindowFocusContext);

  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [lastUsedNavigation, setLastUsedNavigation] = useState(Navigation.KEYBOARD);
  const [lastPressedBackspace, setLastPressedBackspace] = useState(false);

  const searchBarInputEl = useRef(null);
  const [searchBarHeight, searchBarHeightRef] = useHeight();
  const [symbolListHeight, symbolListHeightRef] = useHeight([rows]);

  const rowRefs = useMemo(() => rows.map(() => React.createRef()), [rows]);

  useEffect(() => {
    window.controller.setSymbols = symbolsJSON => {
      const newRows = JSON.parse(symbolsJSON);
      rowSearch.setCollection(newRows);
      setRows(newRows);
      setSelectedRow(newRows[0]);
    };
  }, []);

  const focusRow = useCallback(
    direction => {
      let newIndex = 0;
      const selectedIndex = rows.indexOf(selectedRow);
      switch (direction) {
        case Direction.UP:
          newIndex = selectedIndex > 0 ? selectedIndex - 1 : rows.length - 1;
          break;
        case Direction.DOWN:
          newIndex = (rows.indexOf(selectedRow) + 1) % rows.length;
          break;
        default:
          break;
      }

      if (rowRefs[newIndex].current) {
        rowRefs[newIndex].current.scrollIntoView({ block: 'nearest' });
      }

      setSelectedRow(rows[newIndex]);
    },
    [rowRefs, rows, selectedRow],
  );

  const changeSearchInput = useCallback(value => {
    const newRows = value ? rowSearch.search(value) : rowSearch.list;
    setRows(newRows);
    setSelectedRow(newRows[0]);
  }, []);

  const changeSearchBarInputValue = useCallback(
    value => {
      if (searchBarInputEl.current) {
        searchBarInputEl.current.value = value;
        searchBarInputEl.current.focus();
      }

      changeSearchInput(value);
    },
    [changeSearchInput],
  );

  const insertSymbol = useCallback(row => {
    window.postMessage('insert', row);
  }, []);

  const trackEmptySearch = useCallback(() => {
    if (searchBarInputEl.current && !selectedRow) {
      window.postMessage('analyticsEventEmpty', searchBarInputEl.current.value);
    }
  }, [selectedRow]);

  const handleKeyDown = useCallback(
    event => {
      switch (event.key) {
        case 'ArrowUp':
          focusRow(Direction.UP);
          setLastUsedNavigation(Navigation.KEYBOARD);
          break;
        case 'ArrowDown':
          focusRow(Direction.DOWN);
          setLastUsedNavigation(Navigation.KEYBOARD);
          break;
        case 'Enter':
          if (selectedRow) {
            insertSymbol(selectedRow);
          }
          break;
        case 'Tab':
          if (selectedRow) {
            changeSearchBarInputValue(selectedRow.name);
            window.postMessage('analyticsEventMisc', 'Tab to complete');
          }
          break; // lock focus
        case 'Escape':
          window.postMessage('close');
          window.postMessage('analyticsEventMisc', 'Escape');
          break;
        case 'Backspace':
        case 'Delete':
          if (!lastPressedBackspace) {
            trackEmptySearch();
          }
          setLastPressedBackspace(true);
          return;
        default:
          setLastPressedBackspace(false);
          return;
      }
      event.preventDefault();
    },
    [
      changeSearchBarInputValue,
      focusRow,
      insertSymbol,
      lastPressedBackspace,
      selectedRow,
      trackEmptySearch,
    ],
  );
  const handleContainerMouseMove = useCallback(() => setLastUsedNavigation(Navigation.MOUSE), []);
  const handleRowMouseOver = useCallback(
    row => {
      if (isFocused && lastUsedNavigation === Navigation.MOUSE) {
        setSelectedRow(row);
      }
    },
    [isFocused, lastUsedNavigation],
  );
  const handleRowClick = useCallback(row => insertSymbol(row), [insertSymbol]);
  const handleSearchBarInputChange = value => changeSearchInput(value);

  useEffect(() => window.postMessage('resize', searchBarHeight + symbolListHeight), [
    searchBarHeight,
    symbolListHeight,
  ]);
  useEffect(() => {
    window.controller.reset = () => {
      // reset scroll position

      if (rowRefs[0] && rowRefs[0].current) {
        rowRefs[0].current.scrollIntoView({ block: 'nearest' });
      }

      // track search if empty

      trackEmptySearch();

      // reset list

      changeSearchBarInputValue('');
    };
  }, [changeSearchBarInputValue, rowRefs, trackEmptySearch]);

  return (
    <Container tabIndex="0" onKeyDown={handleKeyDown} onMouseMove={handleContainerMouseMove}>
      <SearchBar
        ref={searchBarHeightRef}
        inputRef={searchBarInputEl}
        onInputChange={handleSearchBarInputChange}
      />
      <SymbolList
        ref={symbolListHeightRef}
        symbols={rows}
        selectedRow={selectedRow}
        onRowMouseOver={handleRowMouseOver}
        onRowClick={handleRowClick}
        shouldScroll={searchBarHeight + symbolListHeight > 448}
        rowRefs={rowRefs}
      />
    </Container>
  );
};

export default SymbolPalette;
