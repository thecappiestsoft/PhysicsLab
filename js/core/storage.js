/**
 * PhysicsLab core — localStorage wrapper (safe in sandboxed frames).
 */
'use strict';

const store = {
  get(k, d) {
    try {
      const v = localStorage.getItem('physicslab.' + k);
      return v == null ? d : JSON.parse(v);
    } catch (e) {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem('physicslab.' + k, JSON.stringify(v));
    } catch (e) {}
  },
};
