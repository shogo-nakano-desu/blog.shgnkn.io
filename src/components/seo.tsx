import React from "react"
import { Helmet } from "react-helmet"
import { useLocation } from "@reach/router"
import { useStaticQuery, graphql } from "gatsby"

interface Props {
  title?: string,
  description?: string,
  image?:string,

}
const SEO:React.FC<Props> = ({ title, description,image }) => {
  const { pathname } = useLocation()

  const { site } = useStaticQuery(graphql`
  query {
    site {
      siteMetadata {
        defaultTitle: title
        defaultDescription: description
        siteUrl: siteUrl
        defaultImage: image
        twitterUsername
      }
    }
  }
`)
  const {
    defaultTitle,
    defaultDescription,
    siteUrl,
    defaultImage,
    twitterUsername,
  } = site.siteMetadata
  const seo = {
    title: title || defaultTitle,
    description: description || defaultDescription,
    image: `${siteUrl}${image || defaultImage}`,
    url: `${siteUrl}${pathname}`,
  }
  // https://blog.shgnkn.ioが返ってくる
  console.log(siteUrl)
  //https://www.shgnkn.io/sakura-vps-centos-nginx見たくフル
  console.log(seo.url)
  console.log(image)
  console.log(seo.image)
  return (
    <Helmet title={seo.title} titleTemplate={`%s | ${defaultTitle}`} htmlAttributes={{
        lang: "ja",
      }} meta={[
      { name: 'description', content: seo.description },
      { name: 'image', content: seo.image },
      { name: 'og:url', content: seo.url },
      { name: 'og:type', content: 'website' },
      { name: 'og:title', content: seo.title },
      { name: 'og:description', content: seo.description },
      { name: 'og:image', content: seo.image },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:creator', content: twitterUsername },
      { name: 'twitter:title', content: title }, { name: 'twitter:description', content: seo.description },
      {name: "twitter:image", content:image}
    ]}>

      {twitterUsername && (
        <meta name="twitter:creator" content={twitterUsername} />
      )}
      {seo.title && <meta name="twitter:title" content={seo.title} />}
      {seo.description && (
        <meta name="twitter:description" content={seo.description} />
      )}
    </Helmet>
  )
}
export default SEO

SEO.defaultProps = {
  title: "blog.shgnkn.io",
  description: "リリース最優先",
  image: "",
}
