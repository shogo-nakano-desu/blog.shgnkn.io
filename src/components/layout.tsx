import * as React from 'react';
import { useStaticQuery, graphql, } from "gatsby";
import * as styles from "./layout.module.css";
import { Header } from "./header"

type Props = {
  pageTitle: string,
}

const Layout: React.FC<Props> = ({ pageTitle, children }  ) => {
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
      <Header></Header>
      <main className={ styles.mainContainer}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
