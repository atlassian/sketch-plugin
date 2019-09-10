import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import SymbolListRow from './SymbolListRow';

const SymbolListContainer = styled.div`
  overflow-y: ${({ shouldScroll }) => (shouldScroll ? 'scroll' : 'hidden')};
  flex-grow: 0;
`;

const SymbolList = React.forwardRef(
  ({ symbols, selectedRow, onRowMouseOver, onRowClick, shouldScroll, rowRefs }, ref) => (
    <SymbolListContainer ref={ref} shouldScroll={shouldScroll}>
      {symbols.map((symbol, i) => (
        <SymbolListRow
          ref={rowRefs[i]}
          key={symbol.name}
          name={symbol.name}
          description={symbol.description}
          isActive={selectedRow === symbol}
          onMouseOver={() => onRowMouseOver(symbol)}
          onFocus={() => onRowMouseOver(symbol)}
          onClick={() => onRowClick(symbol)}
        />
      ))}
    </SymbolListContainer>
  ),
);

const SymbolType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
});

SymbolList.propTypes = {
  symbols: PropTypes.arrayOf(SymbolType).isRequired,
  selectedRow: SymbolType,
  onRowMouseOver: PropTypes.func,
  onRowClick: PropTypes.func,
  shouldScroll: PropTypes.bool,
  rowRefs: PropTypes.arrayOf(PropTypes.shape({ current: PropTypes.instanceOf(Element) })),
};

SymbolList.defaultProps = {
  selectedRow: null,
  onRowMouseOver: () => {},
  onRowClick: () => {},
  shouldScroll: true,
  rowRefs: [],
};

export default SymbolList;
