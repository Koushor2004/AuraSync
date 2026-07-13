# face-api.js model weights

This app loads two lightweight models at runtime, expected here:

- `tiny_face_detector_model-*`
- `face_expression_model-*`

Download them (they're a few hundred KB total, hence "lightweight") from the
official face-api.js weights repo and drop the files directly in this folder:

https://github.com/justadudewhohacks/face-api.js/tree/master/weights

Quick fetch (from the `frontend/` directory):

```bash
curl -L -o public/models/tiny_face_detector_model-weights_manifest.json \
  https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json
curl -L -o public/models/tiny_face_detector_model-shard1 \
  https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1
curl -L -o public/models/face_expression_model-weights_manifest.json \
  https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json
curl -L -o public/models/face_expression_model-shard1 \
  https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-shard1
```

The Detect page (`src/pages/Detect.jsx`) loads them from `/models`, matching
this folder once Vite serves `public/` at the site root.
