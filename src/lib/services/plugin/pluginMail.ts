import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import client from "@sendgrid/client";
import { z } from "zod";

const schema = z.object({
  page: z.coerce.number().positive().min(1).optional().default(1),
  type: z.enum(["list", "contacts"]).optional().default("list")
});

const draftSchema = z.object({
  name: z.string().max(100).min(1),
  categories: z.array(z.string()).max(10).transform((arg) => {
    const unique = new Set(arg);
    return Object.values(unique) as string[];
  }),
  send_at: z.date().nullable(),
  send_to: z.object({
    list_ids: z.array(z.string()).max(50),
    segment_ids: z.array(z.string()).max(10),
    all: z.boolean()
  }),
  email_config: z.object({
    design_id: z.string(),
    editor: z.enum(["design", "code"]),
    suppression_group_id: z.number().nullable(),
    sender_id: z.number().nullable()
  })
});

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET": {
      const { type } = schema.parse(req.query);
      client.setApiKey(process.env.SENDGIRD_API_KEY);

      if (type === "contacts") {

        const [lists, segments, senders, designs] = await Promise.all([
          client.request({
            url: `/v3/marketing/lists`,
            method: 'GET',
          }).then(value => {
            const listData = value[1] as { result: { id: string; name: string; }[] }
            return listData.result.map(value => ({ label: value.name, value: value.id }));
          }),
          client.request({
            url: `/v3/marketing/segments`,
            method: 'GET'
          }).then(value => {
            const segmestData = value[1] as { results: { id: string; name: string; }[] };
            return segmestData.results.map(value => ({ label: value.name, value: value.id }))
          }),
          client.request({
            url: `/v3/verified_senders`,
            method: 'GET',
          }).then(value => {
            const senders = value[1] as { results: { id: number; from_email: string; }[] };
            return senders.results.map(value => ({ label: value.from_email, value: value.id }));
          }),
          client.request({
            url: `/v3/designs`,
            method: 'GET',
          }).then(value => {
            const designs = (value[1] as { result: { id: string; name: string; }[] }).result.map(item => ({ label: item.name, value: item.id }));
            return designs;
          })
        ]);

        return res.status(200).json({
          lists,
          segments,
          senders,
          designs
        });
      }

      const data = await client.request({
        url: `/v3/marketing/contacts/search`,
        method: 'POST',
        body: {
          query: "email LIKE '%@%'"
        }
      });

      const content = (data[1] as { result: { id: string; email: string; }[] });

      return res.status(200).json({
        result: content.result
      });
    }
    case "POST": {
      if (req.query.type !== "draft") throw new createHttpError.BadRequest();
      const request = draftSchema.parse(req.body);

      console.log(request);

      client.setApiKey(process.env.SENDGIRD_API_KEY);

      const response = await client.request({
        url: `/v3/marketing/singlesends`,
        method: 'POST',
        body: request
      });

      const data = response[1] as { id: string; }

      return res.status(202).json({
        id: data.id,
        link: `https://mc.sendgrid.com/single-sends/${data.id}/editor`
      });
    }
    case "DELETE": {
      const { id } = z
        .object({ id: z.string().uuid() })
        .parse(req.query);

      client.setApiKey(process.env.SENDGIRD_API_KEY);

      await client.request({
        url: `/v3/marketing/contacts`,
        method: 'DELETE',
        qs: {
          ids: id
        }
      });

      return res.status(200).json({ ok: true, now: new Date().getTime() });
    }
    default:
      throw createHttpError.MethodNotAllowed();
  }
};

export default handle;
