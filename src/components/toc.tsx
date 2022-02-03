import { Link } from 'gatsby';
import React from 'react';
import * as styles from "./toc.module.css"

interface Props { contents:any,path:string}
export const Toc: React.FC<Props> = ({ contents,path }) => {
  return (
  <>
    <div>
      目次
      </div>
        <ul>
        {contents.map((e: any) => {
          return(
              e.items?.length > 0 ?
              (<>
                <li key={e.title}>
                    <Link to={`/${path}/${e.url}`}>{e.title}</Link>
                </li>
                <li>
                  <ul>
                    {e.items.map((item: any) => {
                      return (
                        <li key={item.title}>
                          <Link to={`/${path}/${item.url}`}>{item.title}</Link>
                        </li>
                      )
                    })}
                  </ul>
                  </li>
                </>
            ): <li key={e.title}>
                    <Link to={`/${path}/${e.url}`}>{e.title}</Link>
                </li>
          )
        })}
        </ul>
  </>
);}
