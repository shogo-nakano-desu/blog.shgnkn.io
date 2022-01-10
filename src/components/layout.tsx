import * as React from 'react';
import { useStaticQuery, graphql } from "gatsby";
import { StaticImage } from 'gatsby-plugin-image'
import * as styles from "./layout.module.css";

const Layout:React.FC<any> = ({ pageTitle, children } ) => {
  console.log(styles)
  const data = useStaticQuery(graphql`
    query{
      site {
        siteMetadata {
          title
        }
      }
    }
  `);
  const title = data?.site?.siteMetadata?.title;
  return (
    <div className={styles.container}>
      <title>
        {pageTitle} | {title}
      </title>
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div>
            <h2 className={ styles.siteTitle}>
              {title}
            </h2>
          </div>
          <div>
            <a className={ styles.icons} href="https://github.com/shogo-nakano-desu">
              <StaticImage className={ styles.image} alt="github octcat icon" src="../images/GitHub-Mark-Light-32px.png"/>
            </a>
            <a className={ styles.icons} href="https://twitter.com/__shogo__">
              <StaticImage className={ styles.image} alt="twitter bird icon" src="../images/Twitter-white.png"></StaticImage>
            </a>
            </div>

          </div>
        {/* </div> */}
      </header>
      <title>{pageTitle}</title>

      <main>
        {children}
      </main>
    </div>
  );
};
export default Layout;
