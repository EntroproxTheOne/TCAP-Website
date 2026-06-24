import React from 'react';

const ViewfinderOverlay = () => (
  <div className="viewfinder-border hidden md:block" aria-hidden="true">
    <div className="viewfinder-corner tl" />
    <div className="viewfinder-corner tr" />
    <div className="viewfinder-corner bl" />
    <div className="viewfinder-corner br" />
  </div>
);

export default ViewfinderOverlay;
