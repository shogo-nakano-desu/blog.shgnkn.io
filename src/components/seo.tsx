import React from "react"
import { Helmet } from "react-helmet"
import { useLocation } from "@reach/router"
import { useStaticQuery, graphql } from "gatsby"

interface Props {
  title?: string,
  summary?: string,
  image?:string,

}
const SEO:React.FC<Props> = ({ title,summary,image }) => {
  const { pathname } = useLocation()

  const { site } = useStaticQuery(graphql`
  query {
    site {
      siteMetadata {
        defaultTitle: title
        siteUrl: siteUrl
        twitterUsername
      }
    }
  }
`)
  const {
    defaultTitle,
    siteUrl,
    twitterUsername,
  } = site.siteMetadata
  const seo = {
    title: title || defaultTitle,
    summary: summary ,
    image: `${siteUrl}${image}`,
    url: `${siteUrl}${pathname}`,
  }

  return (
    <Helmet
      title={seo.title}
      titleTemplate={`%s | ${defaultTitle}`}
      htmlAttributes={{
        lang: "ja",
      }}
      meta={[
        // <meta name="google-site-verification" content="ahfhRF7B-0hIIQOjDPnrietH4aNfl8XuIg2bEPf2rG8" />
      { name: `google-site-verification`, content: `ahfhRF7B-0hIIQOjDPnrietH4aNfl8XuIg2bEPf2rG8`},
      { name: `description`, content: seo.summary },
      seo.image ? { name: `image`, content: seo.image } : {},
      { name: `og:url`, content: seo.url },
      { name: `og:type`, content: `website` },
      { name: `og:title`, content: seo.title },
      { name: `og:description`, content: seo.summary },
      seo.image ? { name: `og:image`, content: seo.image } : {},
      { name: `twitter:card`, content: `summary_large_image` },
      { name: `twitter:creator`, content: twitterUsername },
      { name: `twitter:title`, content: seo.title },
      { name: `twitter:description`, content: seo.summary },
    ]}>
    </Helmet>
  )
}
export default SEO

SEO.defaultProps = {
  title: "blog.shgnkn.io",
  summary: "リリース最優先",
}
