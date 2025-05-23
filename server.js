import { GraphQLSchema, GraphQLObjectType, GraphQLID, GraphQLString, GraphQLList } from 'graphql';
import { createHandler } from 'graphql-http/lib/use/express';
import express from 'express';
import path from 'path';

const app = express();
const port = 3000;

/**
 * Data Sources
 *
 * eg: Database, External API, etc
 */

// Fetch from external resources
const getPosts = async () => {
  const result = await fetch('https://jsonplaceholder.typicode.com/posts');
  return await result.json();
}

const getPost = async (id) => {
  const result = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  return await result.json();
}

// Post type
const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    userId: { type: GraphQLID },
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    body: { type: GraphQLString }
  })
});

// GraphQL schema
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      hello: { 
        type: GraphQLString,
        resolve: () => 'Hello, world!'
      },
      posts: {
        type: new GraphQLList(PostType),
        resolve: async () => {
          return await getPosts();
        }
      },
      post: {
        type: PostType,
        args: {
          id: { type: GraphQLID }
        },
        resolve: async (_parent, args) => {
          return await getPost(args.id);
        }
      }
    },
  }),
});

// Create home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create and use the GraphQL handler.
app.post(
  '/graphql',
  createHandler({
    schema: schema,
  }),
);

// Handling 404 Not Found
app.use((req, res) => {
  res.status(404).json({ data: { error: '404 Page Not Found' } });
});

// Start the server at port
app.listen(port, () => {
  console.log(`GraphQL server listening on port ${port}`)
});
