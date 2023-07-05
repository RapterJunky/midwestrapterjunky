import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { Client } from 'square';
import { z } from 'zod';

import { handleError } from "@api/errorHandler";
import { getSession } from "@lib/getSession";
import prisma from "@api/prisma";

const requestType = z.object({
  type: z.enum(["internal", "square"]).default("internal")
});

const updateCustomer = z.object({
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  phone_number: z.string().optional(),
  address: z.object({
    country: z.string().max(2).min(2).optional(),
    address_line_1: z.string().optional(),
    address_line_2: z.string().optional(),
    locality: z.string().optional(),
    administrative_district_level_1: z.string().optional(),
    administrative_district_level_2: z.string().optional(),
    postal_code: z.string().optional(),
  }).optional()
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getSession(req, res, true);

    const { type } = requestType.parse(req.query);
    switch (req.method) {
      case "GET": {
        switch (type) {
          case "internal": {
            const account = await prisma.account.findFirst({
              where: {
                userId: session.user.id,
              },
              select: {
                provider: true,
              },
            });

            if (!account)
              throw createHttpError.NotFound("Failed to find user account");

            return res.status(200).json({
              provider: account.provider,
            });
          }
          case "square": {
            const user = await prisma.user.findUnique({
              where: {
                id: session.user.id
              }
            });
            if (!user)
              throw createHttpError.NotFound("Failed to find user account");

            const client = new Client({
              accessToken: process.env.SQAURE_ACCESS_TOKEN,
              environment: process.env.SQUARE_MODE,
            });

            if (!user.sqaureId) {
              const profile = await client.customersApi.createCustomer({
                emailAddress: user.email as string
              });

              if (!profile.result.customer) throw createHttpError.InternalServerError("Failed to create customer account");

              await prisma.user.update({
                where: {
                  id: session.user.id,
                },
                data: {
                  sqaureId: profile.result.customer?.id
                }
              });

              return res.status(200).json(profile.result.customer);
            }

            const profile = await client.customersApi.retrieveCustomer(user.sqaureId as string);

            return res.status(200).json(profile.result.customer);
          }
          default: {
            throw new createHttpError.BadRequest();
          }
        }
      }
      case "DELETE": {
        await prisma.user.delete({
          where: {
            id: session.user.id,
          },
        });
        return res.status(200).json({
          status: "ok",
          deleted: new Date(),
        });
      }
      case "PUT": {
        const schema = updateCustomer.parse(req.body);
        const user = await prisma.user.findUnique({
          where: {
            id: session.user.id
          }
        });
        if (!user)
          throw createHttpError.NotFound("Failed to find user account");
        const client = new Client({
          accessToken: process.env.SQAURE_ACCESS_TOKEN,
          environment: process.env.SQUARE_MODE,
        });
        if (!user.sqaureId) throw createHttpError.InternalServerError("No square customer id on user.");

        const profile = await client.customersApi.updateCustomer(user.sqaureId as string, {
          phoneNumber: schema.phone_number,
          givenName: schema.given_name,
          familyName: schema.family_name,
          address: {
            addressLine1: schema.address?.address_line_1,
            addressLine2: schema.address?.address_line_2,
            administrativeDistrictLevel1: schema.address?.administrative_district_level_1,
            administrativeDistrictLevel2: schema.address?.administrative_district_level_2,
            postalCode: schema.address?.postal_code,
            country: schema.address?.country
          }
        });

        return res.status(200).json(profile.result.customer);
      }
      default:
        throw new createHttpError.MethodNotAllowed();
    }
  } catch (error) {
    return handleError(error, res);
  }
};

export default handler;
