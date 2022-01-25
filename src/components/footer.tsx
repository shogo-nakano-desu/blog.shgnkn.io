import * as React from 'react';
import { getYear} from "date-fns"
import * as styles from "./footer.module.css";

export const Footer: React.FC = () => {
  const year = getYear(new Date())
  return (
    <footer>
      <div className={ styles.footer}>{year},{' '}Buit with{' '}<a href="https://www.gatsbyjs.com/">Gatsby</a></div>
    </footer>
  )
}