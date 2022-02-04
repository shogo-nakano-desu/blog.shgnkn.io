import * as React from 'react';
import * as styles from "./layout.module.css";
import { Header } from "./header"
import { Footer } from "./footer"
import {Toc} from "./toc"
import SEO from "./seo"


type Props = {
  pageTitle: string,
  items?: any,
  path?:string
}

const Layout: React.FC<Props> = ({ pageTitle,items,path, children }  ) => {
  return (
    <>
      <SEO title={pageTitle}></SEO>
      <div className={styles.container}>
        {/* <div> */}
          <Header></Header>
          <div className={styles.wrapper}>
            <main className={styles.main}>
              {children}
            </main>
              {path ? <aside className={styles.tocContainer}><Toc contents={items} path={path} /></aside> : <></>}
          </div>
          <Footer></Footer>
        </div>
      {/* </div> */}
    </>
  );
};

export default Layout;
