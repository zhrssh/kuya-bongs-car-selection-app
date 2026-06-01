FROM python:3.12-alpine
WORKDIR /app
COPY . .
RUN pip install --upgrade pip && pip install uv
ENV UV_PROJECT_ENVIRONMENT=/usr/local
COPY pyproject.toml uv.lock ./

RUN uv sync --frozen --no-dev
EXPOSE 5000
ENV FLASK_APP=flaskr
ENV FLASK_ENV=development

RUN flask --app flaskr init-db

ENTRYPOINT ["flask", "--app=flaskr"]
CMD ["run", "--host=0.0.0.0"]