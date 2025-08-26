import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Brain Icon Favicon */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
        <meta name="theme-color" content="#2563eb" />
        
        {/* App Meta */}
        <meta name="description" content="Worqhat - Adaptive Learning Platform with AI-powered intelligent questioning" />
        <meta name="keywords" content="learning, education, AI, intelligent learning, programming, technology" />
        <meta name="author" content="Worqhat" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Worqhat" />
        <meta property="og:description" content="Adaptive Learning Platform with AI-powered intelligent questioning" />
        <meta property="og:image" content="/favicon.svg" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="Worqhat" />
        <meta property="twitter:description" content="Adaptive Learning Platform with AI-powered intelligent questioning" />
        <meta property="twitter:image" content="/favicon.svg" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
