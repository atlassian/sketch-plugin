import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import SearchIcon from './SearchIcon';

const SearchBarContainer = styled.div`
  display: flex;
  width: 100%;
  min-height: 56px;

  border-bottom: 1px solid ${({ theme: { divider } }) => divider};
`;

const SearchInput = styled.input`
  /* remove macOS styling */
  background: none;
  outline: none;
  border: none;
  margin: 0;
  -webkit-appearance: none;

  &::-webkit-search-cancel-button,
  &::-webkit-search-decoration,
  &::-webkit-search-results-button,
  &::-webkit-search-results-decoration {
    -webkit-appearance: none;
  }

  flex-grow: 1;
  height: 56px;
  padding: 16px;
  padding-left: 0;

  font-size: 24px;
  font-weight: 500;
  font-family: -apple-system;
  color: ${({
    theme: {
      text: { normal },
    },
  }) => normal};
  line-height: 28px;
`;

const SearchIconContainer = styled.div`
  margin: 12px;
  margin-right: 8px;
  width: 32px;
  height: 32px;
  color: ${({ theme: { icon } }) => icon};
`;

const SearchBar = React.forwardRef(({ inputRef, onInputChange }, ref) => (
  <SearchBarContainer ref={ref}>
    <SearchIconContainer>
      <SearchIcon />
    </SearchIconContainer>
    <SearchInput
      ref={inputRef}
      type="search"
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
      autoFocus
      onChange={({ target: { value } }) => onInputChange(value)}
    />
  </SearchBarContainer>
));

SearchBar.propTypes = {
  inputRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  onInputChange: PropTypes.func,
};

SearchBar.defaultProps = {
  inputRef: { current: null },
  onInputChange: () => {},
};

export default SearchBar;
