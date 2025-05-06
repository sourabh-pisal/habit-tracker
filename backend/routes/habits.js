import express from "express";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  DeleteCommand,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  }),
);

const TableName = process.env.TABLE_NAME;

const router = express.Router();

router.get("/", async (req, res) => {
  const response = await client.send(new ScanCommand({ TableName }));
  res.json(response.Items);
});

router.post("/", async (req, res) => {
  const habit = req.body;
  await client.send(new PutCommand({ TableName, Item: habit }));
  res.status(201).send();
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  await client.send(new DeleteCommand({ TableName, Key: { id } }));
  res.status(204).send();
});

router.patch("/:id/toggle", async (req, res) => {
  const { date } = req.body;
  const id = req.params.id;

  const response = await client.send(new GetCommand({ TableName, Key: { id } }));
  const currentHabit = response.Item?.history?.[date] ?? false;

  await client.send(
    new UpdateCommand({
      TableName,
      Key: { id },
      UpdateExpression: "SET history.#date = :val",
      ExpressionAttributeNames: {
        "#date": date,
      },
      ExpressionAttributeValues: {
        ":val": !currentHabit,
      },
    }),
  );
  res.status(204).send();
});

export default router;
