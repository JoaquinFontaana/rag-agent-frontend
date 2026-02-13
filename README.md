# ServiceBot AI - Customer Service Assistant

A portfolio project showcasing an AI-powered customer service chatbot built with Next.js and LangGraph SDK. This RAG (Retrieval-Augmented Generation) agent provides instant, accurate responses by searching through a company's knowledge base.

## 🎯 Project Overview

This is a AI customer service solution that:
- Answers customer inquiries using company documentation
- Provides 24/7 automated support
- Retrieves accurate information from uploaded knowledge base documents
- Streams real-time responses for a natural chat experience

## Features

- 🤖 **AI Chat Interface**: Natural conversation with streaming responses
- 🔐 **User Authentication**: Login and registration system
- 📄 **Knowledge Base Management**: Admin portal for uploading support documents
- 🔄 **Real-time Streaming**: Instant responses via LangGraph SDK

## Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Landing page | Public |
| `/chat` | Chat with the RAG agent | Public |
| `/login` | Login page | Public |
| `/register` | Registration page | Public |
| `/admin/documents` | Document upload management | Admin only |
| `/admin/humanInTheLoop` | Human in the loop panel | Admin only |

## Getting Started

### Prerequisites

- Node.js 18+
- A Python backend with LangGraph agent running

### Installation

```bash
npm install
```

### Configuration

Create a `.env.local` file with:

```env
NEXT_PUBLIC_LANGGRAPH_API_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Backend API Requirements

Your Python backend should implement these endpoints:

### Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/register` - Register new user

### Documents (Admin)
- `GET /documents` - List all documents
- `POST /documents/upload` - Upload a document
- `DELETE /documents/:id` - Delete a document

### LangGraph
The frontend uses the LangGraph SDK to communicate with your agent. Make sure your backend exposes the LangGraph API.

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **LangGraph SDK** - Agent communication
