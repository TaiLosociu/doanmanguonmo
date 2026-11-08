import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="vi" className="scroll-smooth">
      <Head>
        <title>Lê Duy Tài | Software Engineer &amp; Full-stack Developer (IT24M)</title>
        <meta
          name="description"
          content="Portfolio cá nhân của Lê Duy Tài (Lớp IT24M) - Software Engineer &amp; Full-stack Developer chuyên về Next.js, NestJS, Neon Serverless PostgreSQL, kiến trúc hệ thống và tối ưu hóa cơ sở dữ liệu."
        />
        <meta
          name="keywords"
          content="Lê Duy Tài,leduytai,IT24M,Software Engineer,Full-stack Developer,NextJS,NestJS,Neon PostgreSQL,Mã Nguồn Mở 2,Đắk Lắk"
        />
        <link rel="icon" href="./avatar.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
