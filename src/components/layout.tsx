import * as React from 'react';
import { FC } from "react";
import { Link, useStaticQuery, graphql } from "gatsby";
import * as styles from "./layout.module.css";

const Layout:FC<any> = ({ pageTitle, children } ) => {
  console.log(styles)
  const data = useStaticQuery<GatsbyTypes.SiteQuery>(graphql`
    query Site{
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
      <nav>
        <ul className={styles.navLinks}>
          <li className={styles.navLinkItem}>
            <Link to="/" className={styles.navLinkText}>
              Home
            </Link>
          </li>
          <li className={styles.navLinkItem}>
            <Link to="/about" className={styles.navLinkText}>
              About
            </Link>
          </li>
          <li className={styles.navLinkItem}>
            <Link to="/blog" className={styles.navLinkText}>
              Blog
            </Link>
          </li>
        </ul>
      </nav>
      <main>
        <h1 className={styles.heading}>{pageTitle}</h1>
        {children}
      </main>
    </div>
  );
};
export default Layout;
