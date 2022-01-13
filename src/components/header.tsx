import * as React from 'react';
import { useStaticQuery, graphql, Link } from "gatsby";
import { StaticImage } from 'gatsby-plugin-image'
import * as styles from "./header.module.css";


export const Header: React.FC= () => {
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
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <div>
          <Link className={styles.siteTitle} to='/'>{title}</Link>
        </div>
        <div>
          <a className={styles.icons} href="https://github.com/shogo-nakano-desu">
            <StaticImage className={styles.image} alt="github octcat icon" src="../images/GitHub-Mark-Light-32px.png" />
          </a>
          <a className={styles.icons} href="https://twitter.com/__shogo__">
            <StaticImage className={styles.image} alt="twitter bird icon" src="../images/Twitter-white.png"></StaticImage>
          </a>
          </div>
      </div>
    </header>
  )
}