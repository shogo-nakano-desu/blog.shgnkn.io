import * as React from 'react';
import { Link, useStaticQuery, graphql } from "gatsby";
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
      <header className={styles.siteTitle}>{title}</header>
      <title>{pageTitle}</title>

      <main>
        <h1 className={styles.heading}>{pageTitle}</h1>
        {children}
      </main>
    </div>
  );
};
export default Layout;
