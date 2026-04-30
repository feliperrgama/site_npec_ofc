# build do front-end
FROM node:20-alpine AS frontend
WORKDIR /frontend

COPY Front-end/package.json Front-end/package-lock.json* ./
RUN npm install

COPY Front-end .
RUN npm run build

FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
COPY --from=frontend /frontend/dist /app/Front-end/dist

EXPOSE 8000
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "API.main:app", "--bind", "0.0.0.0:8000"]