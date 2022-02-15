import * as React from 'react';
import * as styles from "./layout.module.css";
import { Header } from "./header"
import { Footer } from "./footer"
import {Toc} from "./toc"
import SEO from "./seo"


type Props = {
  pageTitle: string,
  pageImage?: string,
  summary?:string,
  items?: any,
  path?:string
}


const Layout: React.FC<Props> = ({ pageTitle,pageImage,summary, items, path, children }) => {
  return (
    <>
      <SEO title={pageTitle} image={pageImage} summary={ summary}></SEO>
      <div className={styles.container}>
          <Header></Header>
          {path
            ?<div className={styles.wrapper}>
                <main className={styles.mainPath}>
                    {children}
                </main>
                <aside className={styles.tocContainer}><Toc contents={items} path={path} /></aside>
              </div>
            :
              <main className={styles.main}>
                {children}
              </main>
          }
          </div>
          <Footer></Footer>


    </>
  );
};

export default Layout;
