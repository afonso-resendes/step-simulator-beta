"use client";
import Head from "next/head";
import ThreeDViewer from "./components/ThreeDViewer";
import { useState } from "react";
import NextImage from "next/image";
import styles from "../styles/page.module.css";
import logo from "../../public/logoStepNew.png";

const Home = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  return (
    <div>
      <Head>
        <title>Allkits Simulator</title>
        {/* <meta name="description" content="Your 3D Sweat Design Simulator" /> */}
        <link rel="icon" href="/favicon.ico" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>
      <div className={styles.titleZone}>
        <div className={styles.titleStruct}>
          <NextImage src={logo} width={70} height={28.5} alt="Step" />
          <p className={styles.desc}>Simulator</p>
        </div>
        {/* <div className={styles.poweredTextMainHeader}>
          <p className={styles.poweredText}>Step Simulator - Hoodie Version </p>
        </div> */}
      </div>

      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f4f4f4",
          margin: "auto",
        }}
      >
        <ThreeDViewer product={product} />
      </main>
    </div>
  );
};

export default Home;
