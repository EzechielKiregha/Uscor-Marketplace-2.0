"use client"

import React from 'react'

function Loader(loading: { loading: boolean }) {

  if (loading.loading) return (
    <div className="flex min-h-screen max-w-full justify-center bg-background items-center h-64">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading data...</p>
      </div>
    </div>
  );
}

export default Loader