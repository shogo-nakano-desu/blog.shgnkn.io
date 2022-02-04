import { Link } from 'gatsby';
import React from 'react';
import * as styles from "./toc.module.css"

interface Props { contents:any,path:string}
export const Toc: React.FC<Props> = ({ contents,path }) => {
  return (
    <div className={ styles.container}>
      <p>
      目次
      </p>
      <ul>
        {contents.map((e: any) => {
          return(
              e.items?.length > 0 ?
              (<>
                <li key={e.title}>
                    <Link to={`/${path}/${e.url}`}>{e.title}</Link>
                </li>
                  <ul>
                    {e.items.map((item: any) => {
                      return (
                        <li className={ styles.h3Tag } key={item.title}>
                          <Link to={`/${path}/${item.url}`}>{item.title}</Link>
                        </li>
                      )
                    })}
                  </ul>
                </>
            ): <li key={e.title}>
                    <Link to={`/${path}/${e.url}`}>{e.title}</Link>
                </li>
          )
        })}
      </ul>
  </div>
);}
