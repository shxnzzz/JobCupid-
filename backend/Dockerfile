FROM node:22-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-venv \
    && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHON_PATH=/opt/venv/bin/python \
    NODE_ENV=production

WORKDIR /app

COPY resume_parser/requirements.txt resume_parser/requirements.txt
RUN pip install --no-cache-dir -r resume_parser/requirements.txt

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 5000
CMD ["node", "server.js"]
