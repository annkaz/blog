import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import Container from '../../components/container'
import PostBody from '../../components/post-body'
import Header from '../../components/header'
import PostHeader from '../../components/post-header'
import Layout from '../../components/layout'
import { getPostBySlug, getAllPosts } from '../../lib/api'
import PostTitle from '../../components/post-title'
import Head from 'next/head'
import { CMS_NAME } from '../../lib/constants'
import markdownToHtml from '../../lib/markdownToHtml'
import PostType from '../../types/post'
import { useState } from 'react'

type Props = {
  post: PostType
  morePosts: PostType[]
  preview?: boolean
}

const Post = ({ post, morePosts, preview }: Props) => {
  const [{username, password}, setUser] = useState({})
  const router = useRouter()
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />
  }
  
  let layout = (<Layout preview={preview}>
    <Container>
      <Header />
      {router.isFallback ? (
        <PostTitle>Loading…</PostTitle>
      ) : (
        <>
          <article className="mb-32">
            <Head>
              <title>
                {post.title} | Next.js Blog Example with {CMS_NAME}
              </title>
              <meta property="og:image" content={post.ogImage.url} />
            </Head>
            <PostHeader
              title={post.title}
              coverImage={post.coverImage}
              date={post.date}
              author={post.author}
            />
            <PostBody content={post.content} />
          </article>
        </>
      )}
    </Container>
  </Layout>)
  
  return (
    {username ? layout : <SignIn />}
  )
}

export default Post

type Params = {
  params: {
    slug: string
  }
}

export async function getStaticProps({ params }: Params) {
  const post = getPostBySlug(params.slug, [
    'title',
    'date',
    'slug',
    'author',
    'content',
    'ogImage',
    'coverImage',
  ])
  const content = await markdownToHtml(post.content || '')

  return {
    props: {
      post: {
        ...post,
        content,
      },
    },
  }
}

export async function getStaticPaths() {
  const posts = getAllPosts(['slug'])

  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      }
    }),
    fallback: false,
  }
}

const SignIn = () => {
  const [username, setUsername] = useState('')
  const [password,setPassword] = useState('')
  
  return (
    <div>
      <form action="" method="get" class="form-example">
        <div class="form-example">
          <label for="name">Enter your username: </label>
          <input onSubmit={setUsername(name)} type="text" name="name" id="name" required>
        </div>
        <div class="form-example">
          <label for="email">Enter your password: </label>
          <input type="email" name="email" id="email" required>
        </div>
        <div class="form-example">
          <input type="submit" value="LogIn!"/>
        </div>
      </form>
    </div>
  )
}
