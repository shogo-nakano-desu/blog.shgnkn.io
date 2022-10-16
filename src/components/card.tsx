import * as React from 'react';
import { GatsbyImage,getImage, ImageDataLike } from 'gatsby-plugin-image';
import * as styles from "./card.module.css";

interface Props{
  data: GatsbyTypes.BlogPostsQuery['allMdx']['nodes'][0]['frontmatter']
}
export const Card: React.FC<Props> = ({ data}) => {
  if (data === undefined ) {
    throw new Error(`should be`)
  }
  const { hero_image, hero_image_alt, title, path, date } = data;
  if (hero_image === undefined||hero_image_alt === undefined||title === undefined||date === undefined||path === undefined) {
    throw new Error(`should be`)
  }

  const image = getImage(hero_image as ImageDataLike)
  if (image === undefined) { throw new Error(`should be`) }

  //[TODO]Linkコンポーネントを使うと、trailing slashがなくなってしまう。
  //回避策としてaタグにしているが、遅いので変えたい。
  //how-i-became-a-software-engineerの記事は検索結果だけでヒットすればOKなのでカードにはしない。他にも除外したい記事が出てきたら、除外フラグみたいなものを作ってもいいかも。
  return path==="how-i-became-a-software-engineer"? <></> :(
    <a className={styles.link} href={`${path}/`}>
      <div>
        <GatsbyImage className={ styles.image} image={image} alt={hero_image_alt} />
        <p className={ styles.title}>{title}</p>
        <p className={ styles.date}>Posted: {date}</p>
      </div>
    </a>
  )
}