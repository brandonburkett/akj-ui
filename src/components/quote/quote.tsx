import React, { StatelessComponent } from 'react';

// styles
import './quote.css';

export interface IProps {
  content: string;
  quotes?: boolean;
  author: string;
}

const defaultProps: Partial<IProps> = {
  quotes: true,
};

/**
 * Block quote component
 */
const Quote: StatelessComponent<IProps> = ({ content, quotes, author }) => (
  <aside id="testimonial" className="group quote translate-z">
    <div className="quote-content">
      <p>
        {quotes ? (
          <React.Fragment>
            &ldquo;
            {content}
            &rdquo;
          </React.Fragment>
        ) : (
          <React.Fragment>{content}</React.Fragment>
        )}
        {author ? <span className="attribute"> - {author}</span> : null}
      </p>
    </div>
  </aside>
);

Quote.defaultProps = defaultProps;

export default Quote;
