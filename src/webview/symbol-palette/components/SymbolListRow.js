import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';

/**
 * There's a lot of CSS here.
 *
 * We've decided that the most important part of a symbol to see is the top left, and we want to fit
 * our symbol previews in a 30vw * 120px box. We don't want to scale our symbols in any way.
 *
 * - If a preview is thinner than 30vw, right-align it, but make sure to add a 16px padding to the
 *   right so it looks pretty. Make sure the text expands to fill the rest of the space to its left.
 * - If a preview is wider than 30vw, make sure the right-hand side of it overflows off the page.
 *   There should be no padding visible.
 * - If a preview is shorter than 120px, vertically center it.
 * - If a preview is taller than 120px, make sure the bottom overflows off the page, while ensuring
 *   that a 16px margin is visible at the top.
 *
 * Honestly, the best way to visualise this is to look at the palette in practice.
 */

const SymbolListRowContainer = styled.div`
  background: ${({
    isActive,
    theme: {
      background: { active },
    },
  }) => (isActive ? active : 'none')};

  /* Text should be left aligned, previews should be right aligned */
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  /* Rows should be at least 80px for vertical rhythm */
  min-height: 80px;
`;

const SymbolDetails = styled.div`
  /* Symbol text should be vertically centered in the available space */
  display: flex;
  flex-direction: column;
  justify-content: center;

  /* Symbol text should expand rightwards into available space */
  flex-grow: 1;

  /* There should be reasonable padding around the text */
  padding: 16px;
`;

const SymbolName = styled.h1`
  font-family: -apple-system;
  font-size: 24px;
  font-weight: 500;
  color: ${({
    isActive,
    theme: {
      text: { normal, active },
    },
  }) => (isActive ? active : normal)};
  line-height: 28px;

  margin: 0;
`;

const SymbolDescription = styled.p`
  font-family: -apple-system;
  font-size: 11px;
  color: ${({
    isActive,
    theme: {
      text: { normal, active },
    },
  }) => (isActive ? active : normal)};
  line-height: 16px;

  margin: 0;
`;

/**
 * The symbol previews have three involved elements!
 *
 * - SymbolPreview sets image-tag-specific properties. These essentially force
 *   the image object to keep its original size when the image element itself changes size.
 * - SymbolPreviewCrop bounds the image to a maximum width and height.
 * - SymbolPreviewContainer ensures that if the image is smaller than those bounds, that it is
 *   right-aligned and vertically centered.
 *
 * When we set a padding, we set it on the SymbolPreview object, because we'd like that padding to
 * be pushed out of bounds if necessary.
 */

const SymbolPreviewContainer = styled.div`
  /**
   * The container will automatically fill available vertical space.
   * If its content is shorter than that, make sure it's vertically centered.
   */
  display: flex;
  flex-direction: column;
  justify-content: center;

  /* If the content fills the horizontal space, flex should respect that */
  flex-shrink: 0;
`;

const SymbolPreviewCrop = styled.div`
  /**
   * display: block introduces a 4px dead space at the bottom.
   * This was the only compromise that kept the max-width and max-height constraints.
   */
  display: grid;

  /* Constrain the width and height of the preview */
  max-width: 30vw;
  max-height: 128px;

  /* If the content overflows the available space, don't show that */
  overflow: hidden;
`;

const SymbolPreview = styled.img`
  /* Keep the original size of the image */
  object-fit: cover;

  /* Anchor the image to the top left */
  object-position: 0 0;

  /* Add top and right padding, as per above. Bottom padding keeps it vertically centered. */
  padding: 16px 16px 16px 0;
`;

/**
 * One more thing: We use the `srcSet` property with a `2x` modifier, because our images are
 * originally exported @2x for Retina displays. Using `srcSet` like this ensures that the images
 * take up the appropriate amount of space (half of what they otherwise would).
 */

const SymbolListRow = React.forwardRef(
  ({ name, description, isActive, onMouseOver, onFocus, onKeyDown, onClick }, ref) => (
    <SymbolListRowContainer
      ref={ref}
      isActive={isActive}
      onMouseOver={onMouseOver}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      onClick={onClick}
    >
      <SymbolDetails>
        <SymbolName isActive={isActive}>{name}</SymbolName>
        <SymbolDescription isActive={isActive}>{description}</SymbolDescription>
      </SymbolDetails>
      <SymbolPreviewContainer>
        <SymbolPreviewCrop>
          <SymbolPreview srcSet={`../symbol-palette/preview/${name.replace(/ /g, '%20')}.png 2x`} />
        </SymbolPreviewCrop>
      </SymbolPreviewContainer>
    </SymbolListRowContainer>
  ),
);

SymbolListRow.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onMouseOver: PropTypes.func,
  onFocus: PropTypes.func,
  onKeyDown: PropTypes.func,
  onClick: PropTypes.func,
};

SymbolListRow.defaultProps = {
  onMouseOver: () => {},
  onFocus: () => {},
  onKeyDown: () => {},
  onClick: () => {},
};

export default SymbolListRow;
