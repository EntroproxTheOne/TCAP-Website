import React, { Component } from 'react';

/** Catches R3F / GLB runtime crashes so the page doesn't white-screen */
export class ThreeErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#cc0000] text-white p-8">
          <div className="max-w-md text-center">
            <p className="font-mono text-sm uppercase tracking-widest mb-2">3D Scene Error</p>
            <p className="text-sm opacity-80 mb-4">{this.state.error.message}</p>
            <button
              type="button"
              className="px-4 py-2 bg-white text-black text-sm font-bold uppercase"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
