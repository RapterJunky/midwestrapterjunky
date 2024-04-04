import type { Control } from "react-hook-form";
import type { CheckoutState } from "@/components/providers/CheckoutProvider";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const AddressForm: React.FC<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<CheckoutState, any>;
  comments: boolean;
  name: string;
  type: "shipping" | "billing";
}> = ({ control, type, comments, name }) => {
  return (
    <div className="ph-no-capture space-y-2">
      <div className="mb-4">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          {name} Address
        </h1>
        <Separator />
      </div>
      <div className="flex w-full gap-2">
        <FormField
          rules={{
            maxLength: {
              message: "Max length is 100 characters.",
              value: 100,
            },
            required: "A name is required.",
          }}
          control={control}
          name={`${type}.givenName`}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="John"
                  type="text"
                  required
                  className="ph-no-capture"
                  autoComplete="given-name"
                  maxLength={100}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          rules={{
            maxLength: {
              message: "Max length is 100 characters.",
              value: 100,
            },
            required: "A last name is required.",
          }}
          control={control}
          name={`${type}.familyName`}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Doe"
                  type="text"
                  required
                  className="ph-no-capture"
                  autoComplete="family-name"
                  maxLength={100}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        rules={{
          required: "An address is required.",
        }}
        control={control}
        name={`${type}.address_line`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address line 1 (or company name)</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="542 W. 15th Street"
                type="text"
                required
                className="ph-no-capture"
                autoComplete={`${type} address-line-1`}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`${type}.address_line2`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address line 2 (SelectItemal)</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Apt. (SelectItemal)"
                type="text"
                className="ph-no-capture"
                autoComplete={`${type} address-line-2`}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        rules={{ required: "A city is required." }}
        control={control}
        name={`${type}.city`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>City</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="city"
                type="text"
                className="ph-no-capture"
                autoComplete="city"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
        <FormField
          rules={{ required: "Please select a country." }}
          control={control}
          name={`${type}.country`}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Country or region</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  autoComplete="country"
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="" disabled>
                      Country
                    </SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          rules={{ required: "Please select a state." }}
          control={control}
          name={`${type}.state`}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>State</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="New York" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    <SelectItem value="" disabled>
                      State
                    </SelectItem>
                    <SelectItem value="AL">Alabama</SelectItem>
                    <SelectItem value="AK">Alaska</SelectItem>
                    <SelectItem value="AZ">Arizona</SelectItem>
                    <SelectItem value="AR">Arkansas</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="CO">Colorado</SelectItem>
                    <SelectItem value="CT">Connecticut</SelectItem>
                    <SelectItem value="DE">Delaware</SelectItem>
                    <SelectItem value="DC">District of Columbia</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="GA">Georgia</SelectItem>
                    <SelectItem value="HI">Hawaii</SelectItem>
                    <SelectItem value="ID">Idaho</SelectItem>
                    <SelectItem value="IL">Illinois</SelectItem>
                    <SelectItem value="IN">Indiana</SelectItem>
                    <SelectItem value="IA">Iowa</SelectItem>
                    <SelectItem value="KS">Kansas</SelectItem>
                    <SelectItem value="KY">Kentucky</SelectItem>
                    <SelectItem value="LA">Louisiana</SelectItem>
                    <SelectItem value="ME">Maine</SelectItem>
                    <SelectItem value="MD">Maryland</SelectItem>
                    <SelectItem value="MA">Massachusetts</SelectItem>
                    <SelectItem value="MI">Michigan</SelectItem>
                    <SelectItem value="MN">Minnesota</SelectItem>
                    <SelectItem value="MS">Mississippi</SelectItem>
                    <SelectItem value="MO">Missouri</SelectItem>
                    <SelectItem value="MT">Montana</SelectItem>
                    <SelectItem value="NE">Nebraska</SelectItem>
                    <SelectItem value="NV">Nevada</SelectItem>
                    <SelectItem value="NH">New Hampshire</SelectItem>
                    <SelectItem value="NJ">New Jersey</SelectItem>
                    <SelectItem value="NM">New Mexico</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="NC">North Carolina</SelectItem>
                    <SelectItem value="ND">North Dakota</SelectItem>
                    <SelectItem value="OH">Ohio</SelectItem>
                    <SelectItem value="OK">Oklahoma</SelectItem>
                    <SelectItem value="OR">Oregon</SelectItem>
                    <SelectItem value="PA">Pennsylvania</SelectItem>
                    <SelectItem value="RI">Rhode Island</SelectItem>
                    <SelectItem value="SC">South Carolina</SelectItem>
                    <SelectItem value="SD">South Dakota</SelectItem>
                    <SelectItem value="TN">Tennessee</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="UT">Utah</SelectItem>
                    <SelectItem value="VT">Vermont</SelectItem>
                    <SelectItem value="VA">Virginia</SelectItem>
                    <SelectItem value="WA">Washington</SelectItem>
                    <SelectItem value="WV">West Virginia</SelectItem>
                    <SelectItem value="WI">Wisconsin</SelectItem>
                    <SelectItem value="WY">Wyoming</SelectItem>
                    <SelectItem value="AS">American Samoa</SelectItem>
                    <SelectItem value="AA">Armed Forces Americas</SelectItem>
                    <SelectItem value="AE">Armed Forces Europe</SelectItem>
                    <SelectItem value="AP">Armed Forces Pacific</SelectItem>
                    <SelectItem value="FM">
                      Federated States of Micronesia
                    </SelectItem>
                    <SelectItem value="GU">Guam</SelectItem>
                    <SelectItem value="MH">Marshall Islands</SelectItem>
                    <SelectItem value="MP">Northern Mariana Islands</SelectItem>
                    <SelectItem value="PW">Palau</SelectItem>
                    <SelectItem value="PR">Puerto Rico</SelectItem>
                    <SelectItem value="VI">Virgin Islands</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          rules={{
            required: "Please enter a postal code",
            minLength: {
              value: 5,
              message: "Min length is 4 characters",
            },
            pattern: {
              value: /[0-9]+/,
              message: "Must only contain numbers",
            },
            maxLength: {
              value: 20,
              message: "Max length is 20 characters.",
            },
          }}
          control={control}
          name={`${type}.postalCode`}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Zip / Postal Code</FormLabel>
              <FormControl>
                <Input
                  maxLength={20}
                  inputMode="numeric"
                  required
                  {...field}
                  placeholder="10001"
                  type="text"
                  autoComplete="postal-code"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        rules={{
          required: "Please enter a phone number",
          pattern: {
            value: /[\d \-\+]+/,
            message: "",
          },
          maxLength: {
            value: 30,
            message: "Max length is 30 characters.",
          },
        }}
        control={control}
        name={`${type}.phone`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <FormControl>
              <Input
                pattern="[\d \-\+]+"
                maxLength={30}
                inputMode="numeric"
                required
                className="ph-no-capture"
                {...field}
                placeholder="+1 321 456 3987"
                type="tel"
                autoComplete="tel"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {comments ? (
        <FormField
          rules={{
            maxLength: {
              value: 200,
              message:
                "Please enter a message that is less then 200 characters.",
            },
          }}
          control={control}
          name="shipping.comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zip / Postal Code</FormLabel>
              <FormControl>
                <Textarea
                  className="ph-no-capture"
                  placeholder="Comments (optonal)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}
    </div>
  );
};

export default AddressForm;
