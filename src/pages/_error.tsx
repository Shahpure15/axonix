import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode: number;
  hasGetInitialPropsRun?: boolean;
  err?: Error;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600 mb-4">{statusCode}</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {statusCode === 404
            ? 'This page could not be found'
            : 'An error occurred on the server'}
        </h2>
        <p className="text-gray-600 mb-8">
          {statusCode === 404
            ? 'The page you are looking for does not exist.'
            : 'Something went wrong. Please try again later.'}
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;