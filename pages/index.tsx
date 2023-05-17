import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Midwest Raptor Junkies</title>
        <meta name="description" content="The home of Midwest Raptor Junkies" />
        <link rel="icon" href="/logo.png" />
        <meta name="robots" content="index, follow"/>
      </Head>

      <main className={styles.main}>
          <section className={styles.container_side}>
              <Image className={styles.container_side_img} src="/marek-piwnicki-bk4vuZAJNqM-unsplash.jpg" alt="background" fill/>
              <div>
                <Image className={styles.logo} alt="midwestraptorjunkies logo" src="/new_logo.webp" height={300} width={300}/>
              </div>
          </section>

          <section className={styles.container_main}>
            <div className={styles.card}>
              <h1>Our website is under construction</h1>
              <h2>Check back later!</h2>
            </div>
          </section>
      </main>

    </div>
  )
}

export default Home;