import { z } from "zod";

export const registrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(200, "Name is too long"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(20, "Please enter a valid phone number")
    .regex(/^[+\d][\d\s-]+$/, "Please enter a valid phone number"),
  relationship: z.enum(
    [
      "brides_family",
      "grooms_family",
      "brides_friend",
      "grooms_friend",
      "family_friend",
      "colleague",
      "church_member",
      "other",
    ],
    { errorMap: () => ({ message: "Please select your relationship" }) },
  ),
  invitedBy: z
    .string()
    .trim()
    .min(2, "Please tell us who invited you")
    .max(200),
  attendanceResponse: z.enum(["definitely", "likely", "unsure", "declined"], {
    errorMap: () => ({ message: "Please select an option" }),
  }),
  consent: z.literal(true, {
    errorMap: () => ({
      message: "You must accept the privacy notice to register",
    }),
  }),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
