import React from 'react'

function Loader(loading: { loading: boolean }) {

  if (loading.loading) return (
    <div className="flex flex-col my-20 bg-background dark:bg-gray-950 justify-center items-center">
      <div className="w-8 h-8 bg-orange-600 rounded animate-spin"></div>
    </div>
  );
}

export default Loader