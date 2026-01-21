import { configureStore } from "@reduxjs/toolkit"

export default configureStore({
  reducer: {
    app: (state = {}) => state,
  },
})
