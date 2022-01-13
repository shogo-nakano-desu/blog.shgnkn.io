import * as React from 'react';
import { useStaticQuery, graphql, } from "gatsby";
import * as styles from "./layout.module.css";
import { Header } from "./header"
import { Footer } from "./footer"
import SEO from "./seo"

type Props = {
  pageTitle: string,
}

const Layout: React.FC<Props> = ({ pageTitle, children }  ) => {
  return (
    <>
      <SEO title={pageTitle}></SEO>
      <div className={styles.container}>
        <Header></Header>
        <main className={ styles.mainContainer}>
          {children}
        </main>
        <Footer></Footer>
        </div>
    </>
  );
};

export default Layout;
