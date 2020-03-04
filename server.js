const express = require('express')
const expressGraphQL = require('express-graphql')
const {
GraphQLSchema,
GraphQLObjectType,
GraphQLString,
GraphQLList,
GraphQLInt,
GraphQLNonNull
} = require('graphql')

const authors = [
	{ id: 1, name: 'E. Hemingway' },
	{ id: 2, name: ' R. Branson' },
	{ id: 3, name: 'C. Discens' }
]

const books = [
	{ id: 1, name: 'The Torrents of Spring ', authorId: 1 },
	{ id: 2, name: 'The Sun Also Rises', authorId: 1 },
	{ id: 3, name: 'A Farewell to Arms', authorId: 1 },
	{ id: 4, name: 'Finding My VIrginity ', authorId: 2 },
	{ id: 5, name: 'Losing My VIrginity', authorId: 2 },
	{ id: 6, name: 'Globalisation Laid Bare', authorId: 2 },
	{ id: 7, name: 'Oliver Twist', authorId: 3 },
	{ id: 8, name: 'A tale of two cities', authorId: 3 }
]

const app = express()

const BookType = new GraphQLObjectType({
    name: 'Book',
    description:'A single Book written by author',
    fields:()=>({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name:{type:GraphQLNonNull(GraphQLString)},
        authorId:{type: GraphQLNonNull(GraphQLInt)},
        author:{type: AuthorType,
               resolve: (book)=> {
                return authors.find(author => author.id === book.authorId)
            }
        }       
    })
})
const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description:'An author of a Book',
    fields:()=>({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name:{type:GraphQLNonNull(GraphQLString)},
        books: {type:new GraphQLList(BookType),
        resolve: (author) => {
            return books.filter(book =>book.authorId === author.id)
        }}     
    })
})

const RootQueryType = new GraphQLObjectType({
    name:'Query',
    description: 'Root Query',
    fields: () => ({
        book: {type: BookType,
            description:'A single book',
            args:{
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => books.find(book=> book.id === args.id)
    },
       author: {type: AuthorType,
        description:'A single author',
        args:{
            id: {type: GraphQLInt}
        },
        resolve: (parent, args) => authors.find(author=> author.id === args.id)
    },
        books: {type: new GraphQLList(BookType),
                description:'List of all books',
                resolve: () => books
        },
        authors: {type: new GraphQLList(AuthorType),
            description:'List of all Authors',
            resolve: () => authors
    }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
      addBook: {
        type: BookType,
        description: 'Add a book',
        args: {
          name: { type: GraphQLNonNull(GraphQLString) },
          authorId: { type: GraphQLNonNull(GraphQLInt) }
        },
        resolve: (parent, args) => {
          const book = { id: books.length + 1, name: args.name, authorId: args.authorId }
          books.push(book)
          return book
        }
      },
      addAuthor: {
        type: AuthorType,
        description: 'Add an author',
        args: {
          name: { type: GraphQLNonNull(GraphQLString) }
        },
        resolve: (parent, args) => {
          const author = { id: authors.length + 1, name: args.name }
          authors.push(author)
          return author
        }
      }
    })
  })

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation:RootMutationType
})

app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}))
app.listen (5000, ()=> console.log('Server is Running'))