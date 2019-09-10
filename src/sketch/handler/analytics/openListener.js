/**
 * @file Track Sketch actions for opening and closing the document.
 */
import event, { CATEGORY_OPEN } from '../../util/analytics/analytics';

/**
 * Handle 'open document' by starting a new session.
 *
 * @param {object} context - Sketch context.
 */
export const onOpenDocument = context => {
  event(context, CATEGORY_OPEN, 'Open Document', null, null, 'start');
};

/**
 * Handle 'close document' by ending the session.
 *
 * @param {object} context - Sketch context.
 */
export const onCloseDocument = context => {
  event(context, CATEGORY_OPEN, 'Close Document', null, null, 'end');
};
