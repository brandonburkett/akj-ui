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
  <section id="testimonial" className="group quote">
    <div className="content">
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
  </section>
);

Quote.defaultProps = defaultProps;

export default Quote;
