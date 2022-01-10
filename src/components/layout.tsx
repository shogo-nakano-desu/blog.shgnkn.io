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
      <header className={styles.siteTitle}>
        {title}
        <StaticImage alt="github octcat icon" src="../images/GitHub-Mark-Light-32px.png"/>
      </header>
      <title>{pageTitle}</title>

      <main>
        {children}
      </main>
    </div>
  );
};
export default Layout;
