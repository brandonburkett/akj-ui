import * as React from 'react';

// ui
import Head from '../../components/head/head';
import PanelContent from '../../components/panels/panel-content';
import PanelSection from '../../components/panels/panel-section';
import Quote from '../../components/quote/quote';

export interface IProps {
  location: {
    pathname: string;
  };
}

/**
 * Covid-19 schedule updates
 */
const Covid19: React.FunctionComponent<IProps> = props => (
  <React.Fragment>
    <Head
      title="COVID-19 Schedule Updates"
      desc="Updated policies and procedures for keiko after May 19th."
      path={props.location.pathname}
    />
    <div id="main" className="group" role="main">
      <PanelSection>
        <PanelContent fullViewHeight={true}>
          <div className="cs12">
            <h1>COVID-19 Schedule</h1>
            <p>
              The Austin Sports Center will be opening back up <strong>May 19th</strong> at 25%
              capacity. In order to train, we have to follow the updated policies and procedures set
              by the Austin Sports Center (below).{' '}
              <strong>These must be completed each class 24 hours before keiko</strong>. Please
              remember we are all representing Komei Jyuku as we enter and leave the building.
            </p>
            <p>
              If you do not feel comfortable with any of the information below, please wait to
              return to training.
            </p>
            <hr className="dark" />
          </div>

          <div className="cs6">
            <h3>Policies and Procedures</h3>
            <ul className="ul_disc">
              <li>
                Each person is required to self-screen and stays at home if they show symptoms or
                been in contact with someone who has been diagnosed with COVID 19 in the last 14
                days.
              </li>
              <li>
                The Austin Sports Center will be taking contactless temperatures at the door. Anyone
                with a fever of 100.4 and higher will be asked to leave
              </li>
              <li>A mask must be worn at all times</li>
              <li>Clean up trash and leftover belongings as our group exits</li>
              <li>
                Each participant must bring their own water bottle and towel for cleaning sweat.
              </li>
              <li>Restrooms are one person at a time</li>
              <li>
                If someone from our group is confirmed with COVID we must contact ASC immediately
              </li>
              <li>
                Please come already dressed for keiko, we will not have much time to change into
                keikogi and hakama
              </li>
              <li>
                Do not show up earlier than five minutes before keiko and no gathering at the
                entrance
              </li>
              <li>
                We must maintain social distancing while on the property and not training (during
                breaks, instruction periods, entering and exiting)
              </li>
              <li>
                <strong>No spectators for now</strong>. This could change in the future
              </li>
            </ul>
          </div>
          <div className="cs6">
            <h3>24 Hours Before Keiko - Online Waiver Process</h3>
            <ol className="ol_decimal">
              <li>
                <strong>
                  Everyone is required to fill out the{' '}
                  <a
                    className="link"
                    href="https://www.emailmeform.com/builder/form/eK53ytxB0cea6EA3dHdeDq2"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Austin Sports Center waiver
                  </a>{' '}
                  24 hours before keiko
                </strong>
              </li>
              <li>
                When complete, you will receive an email from the Austin Sports Center,{' '}
                <strong>
                  this MUST be forwarded to brandon&#64;komeijyuku.com 24 hours before keiko
                </strong>
              </li>
            </ol>

            <p>
              Brandon sensei is required to compile the contract tracing list (for the Austin Sports
              Center) as well as have all the waivers electronically on file.
            </p>
            <h4>
              Important: <strong>A new waiver must be filled out upon each visit</strong>
            </h4>
          </div>
        </PanelContent>
      </PanelSection>
      <Quote
        content="The most difficult rival you will ever face is yourself."
        author="Sekiguchi Komei sensei"
      />
    </div>
  </React.Fragment>
);

export default Covid19;
