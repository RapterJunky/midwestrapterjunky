import type { UseFormRegister, FieldPath, FieldErrors } from "react-hook-form";
import type { CheckoutState } from "@/pages/shop/checkout";
import { capitlize } from "@lib/utils/capitlize";
import get from "@lib/utils/get";

export type UseFormValues = FieldPath<CheckoutState>;

type Props = {
  register: UseFormRegister<CheckoutState>;
  disabled?: boolean;
  errors: FieldErrors<CheckoutState>;
  ids: {
    address1: UseFormValues;
    address2: UseFormValues;
    city: UseFormValues;
    country: UseFormValues;
    state: UseFormValues;
    postal: UseFormValues;
    firstname: UseFormValues;
    lastname: UseFormValues;
    phone: UseFormValues;
    notes?: UseFormValues;
  };
  name: string;
};

//https://web.dev/payment-and-address-form-best-practices/#html-elements
const AddressForm: React.FC<Props> = ({
  ids,
  name,
  disabled = false,
  register,
  errors,
}) => {
  const firstnameError = get(errors, ids.firstname);
  const lastnameError = get(errors, ids.lastname);
  const address1Error = get(errors, ids.address1);
  const cityError = get(errors, ids.city);
  const countryError = get(errors, ids.country);
  const stateError = get(errors, ids.state);
  const postalError = get(errors, ids.postal);
  const phoneError = get(errors, ids.phone);
  const notesError = ids.notes ? get(errors, ids.notes) : undefined;

  return (
    <>
      <div className="mb-4">
        <h1 className="mb-1 text-3xl font-semibold">
          {capitlize(name)} Address
        </h1>
        <hr className="w-full" />
      </div>
      <div className="flex gap-2">
        <div className="mb-4 w-full">
          <label htmlFor={`${name}-firstname`} className="text-gray-700">
            First Name
          </label>
          <input
            data-cy={`${name}-firstname-input`}
            {...register(ids.firstname, {
              disabled,
              required: "A name is required.",
              maxLength: {
                message: "Max length is 100 characters.",
                value: 100,
              },
            })}
            maxLength={100}
            required
            autoComplete="given-name"
            id={`${name}-firstname`}
            className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            type="text"
            placeholder="John Doe"
          />
          {firstnameError ? (
            <span className="mt-1 block text-red-500">
              {firstnameError.message}
            </span>
          ) : null}
        </div>
        <div className="mb-4 w-full">
          <label htmlFor={`${name}-lastname`} className="text-gray-700">
            Last Name
          </label>
          <input
            data-cy={`${name}-lastname-input`}
            {...register(ids.lastname, {
              disabled,
              required: "A name is required.",
              maxLength: {
                message: "Max length is 100 characters.",
                value: 100,
              },
            })}
            maxLength={100}
            required
            autoComplete="family-name"
            id={`${name}-lastname`}
            className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            type="text"
            placeholder="John Doe"
          />
          {lastnameError ? (
            <span className="mt-1 block text-red-500">
              {lastnameError.message}
            </span>
          ) : null}
        </div>
      </div>
      <div>
        <div className="mb-4">
          <label htmlFor={`${name}-address1`}>
            <span className="text-gray-700">
              Address line 1 (or company name)
            </span>
          </label>
          <input
            data-cy={`${name}-address1-input`}
            {...register(ids.address1, {
              disabled,
              required: "An address is required.",
            })}
            required
            autoComplete={`${name} address-line-1`}
            id={`${name}-address1`}
            className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            type="text"
            placeholder="542 W. 15th Street"
          />
          {address1Error ? (
            <span className="mt-1 block text-red-500">
              {address1Error.message}
            </span>
          ) : null}
        </div>
        <div className="mb-4">
          <label htmlFor={`${name}-address2`}>
            <span className="text-gray-700">Address line 2 (optional)</span>
          </label>
          <input
            data-cy={`${name}-address2-input`}
            {...register(ids.address2)}
            autoComplete={`${name} address-line-2`}
            id={`${name}-address2`}
            className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            type="text"
            placeholder="Apt. (optional)"
          />
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor={`${name}-city`}>
          <span className="text-gray-700">City</span>
        </label>
        <input
          data-cy={`${name}-city-input`}
          {...register(ids.city, {
            disabled,
            required: "A city is required.",
          })}
          required
          autoComplete="city"
          id={`${name}-city`}
          className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          type="text"
          placeholder="city"
        />
        {cityError ? (
          <span className="mt-1 block text-red-500">{cityError.message}</span>
        ) : null}
      </div>
      <div className="flex gap-2">
        <div className="mb-4 w-full">
          <label htmlFor={`${name}-country`}>
            <span className="text-gray-700">Country or region</span>
          </label>
          <select
            data-cy={`${name}-country-input`}
            required
            defaultValue="US"
            {...register(ids.country, {
              disabled,
              required: "Please select a country.",
            })}
            id={`${name}-country`}
            className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            autoComplete="country"
            placeholder="New York"
            enterKeyHint="done"
          >
            <option value="" disabled>
              Country
            </option>
            <option value="US">United States</option>
          </select>
          {countryError ? (
            <span className="mt-1 block text-red-500">
              {countryError.message}
            </span>
          ) : null}
        </div>
        <div className="mb-4 w-full">
          <label htmlFor={`${name}-state`}>
            <span className="text-gray-700">State</span>
          </label>
          <select
            data-cy={`${name}-state-input`}
            {...register(ids.state, {
              disabled,
              required: "Please select a state.",
            })}
            required
            id={`${name}-state`}
            enterKeyHint="done"
            className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="" disabled>
              State
            </option>
            <option value="AL" label="Alabama">
              Alabama
            </option>
            <option value="AK" label="Alaska">
              Alaska
            </option>
            <option value="AZ" label="Arizona">
              Arizona
            </option>
            <option value="AR" label="Arkansas">
              Arkansas
            </option>
            <option value="CA" label="California">
              California
            </option>
            <option value="CO" label="Colorado">
              Colorado
            </option>
            <option value="CT" label="Connecticut">
              Connecticut
            </option>
            <option value="DE" label="Delaware">
              Delaware
            </option>
            <option value="DC" label="District of Columbia">
              District of Columbia
            </option>
            <option value="FL" label="Florida">
              Florida
            </option>
            <option value="GA" label="Georgia">
              Georgia
            </option>
            <option value="HI" label="Hawaii">
              Hawaii
            </option>
            <option value="ID" label="Idaho">
              Idaho
            </option>
            <option value="IL" label="Illinois">
              Illinois
            </option>
            <option value="IN" label="Indiana">
              Indiana
            </option>
            <option value="IA" label="Iowa">
              Iowa
            </option>
            <option value="KS" label="Kansas">
              Kansas
            </option>
            <option value="KY" label="Kentucky">
              Kentucky
            </option>
            <option value="LA" label="Louisiana">
              Louisiana
            </option>
            <option value="ME" label="Maine">
              Maine
            </option>
            <option value="MD" label="Maryland">
              Maryland
            </option>
            <option value="MA" label="Massachusetts">
              Massachusetts
            </option>
            <option value="MI" label="Michigan">
              Michigan
            </option>
            <option value="MN" label="Minnesota">
              Minnesota
            </option>
            <option value="MS" label="Mississippi">
              Mississippi
            </option>
            <option value="MO" label="Missouri">
              Missouri
            </option>
            <option value="MT" label="Montana">
              Montana
            </option>
            <option value="NE" label="Nebraska">
              Nebraska
            </option>
            <option value="NV" label="Nevada">
              Nevada
            </option>
            <option value="NH" label="New Hampshire">
              New Hampshire
            </option>
            <option value="NJ" label="New Jersey">
              New Jersey
            </option>
            <option value="NM" label="New Mexico">
              New Mexico
            </option>
            <option value="NY" label="New York">
              New York
            </option>
            <option value="NC" label="North Carolina">
              North Carolina
            </option>
            <option value="ND" label="North Dakota">
              North Dakota
            </option>
            <option value="OH" label="Ohio">
              Ohio
            </option>
            <option value="OK" label="Oklahoma">
              Oklahoma
            </option>
            <option value="OR" label="Oregon">
              Oregon
            </option>
            <option value="PA" label="Pennsylvania">
              Pennsylvania
            </option>
            <option value="RI" label="Rhode Island">
              Rhode Island
            </option>
            <option value="SC" label="South Carolina">
              South Carolina
            </option>
            <option value="SD" label="South Dakota">
              South Dakota
            </option>
            <option value="TN" label="Tennessee">
              Tennessee
            </option>
            <option value="TX" label="Texas">
              Texas
            </option>
            <option value="UT" label="Utah">
              Utah
            </option>
            <option value="VT" label="Vermont">
              Vermont
            </option>
            <option value="VA" label="Virginia">
              Virginia
            </option>
            <option value="WA" label="Washington">
              Washington
            </option>
            <option value="WV" label="West Virginia">
              West Virginia
            </option>
            <option value="WI" label="Wisconsin">
              Wisconsin
            </option>
            <option value="WY" label="Wyoming">
              Wyoming
            </option>
            <option value="AS" label="American Samoa">
              American Samoa
            </option>
            <option value="AA" label="Armed Forces Americas">
              Armed Forces Americas
            </option>
            <option value="AE" label="Armed Forces Europe">
              Armed Forces Europe
            </option>
            <option value="AP" label="Armed Forces Pacific">
              Armed Forces Pacific
            </option>
            <option value="FM" label="Federated States of Micronesia">
              Federated States of Micronesia
            </option>
            <option value="GU" label="Guam">
              Guam
            </option>
            <option value="MH" label="Marshall Islands">
              Marshall Islands
            </option>
            <option value="MP" label="Northern Mariana Islands">
              Northern Mariana Islands
            </option>
            <option value="PW" label="Palau">
              Palau
            </option>
            <option value="PR" label="Puerto Rico">
              Puerto Rico
            </option>
            <option value="VI" label="Virgin Islands">
              Virgin Islands
            </option>
          </select>
          {stateError ? (
            <span className="mt-1 block text-red-500">
              {stateError.message}
            </span>
          ) : null}
        </div>
        <div className="mb-4 w-full">
          <label htmlFor={`${name}-postal`}>
            <span className="text-gray-700">Zip / Postal Code</span>
          </label>
          <input
            data-cy={`${name}-postal-input`}
            {...register(ids.postal, {
              disabled,
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
            })}
            maxLength={20}
            required
            inputMode="numeric"
            autoComplete="postal-code"
            id={`${name}-postal`}
            className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            type="text"
            placeholder="10001"
          />
          {postalError ? (
            <span className="mt-1 block text-red-500">
              {postalError.message}
            </span>
          ) : null}
        </div>
      </div>
      <div className="mb-4 w-full">
        <label htmlFor={`${name}-phone`}>
          <span className="text-gray-700">Phone</span>
        </label>
        <input
          data-cy={`${name}-phone-input`}
          {...register(ids.phone, {
            disabled,
            required: "Please enter a phone number",
            pattern: {
              value: /[\d \-\+]+/,
              message: "",
            },
            maxLength: {
              value: 30,
              message: "Max length is 30 characters.",
            },
          })}
          pattern="[\d \-\+]+"
          maxLength={30}
          required
          autoComplete="tel"
          id={`${name}-phone`}
          className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          type="tel"
          placeholder="+1 321 456 3987"
        />
        {phoneError ? (
          <span className="mt-1 block text-red-500">{phoneError.message}</span>
        ) : null}
      </div>
      {ids.notes ? (
        <div className="mb-4">
          <label htmlFor={`${name}-comments`}>
            <span className="text-gray-700">Comments</span>
          </label>
          <textarea
            data-cy={`${name}-comments-input`}
            {...register(ids.notes, {
              maxLength: {
                value: 200,
                message:
                  "Please enter a message that is less then 200 characters.",
              },
            })}
            autoComplete="tel"
            id={`${name}-phone`}
            className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="Comments (optonal)"
          />
          {notesError ? (
            <span className="mt-1 block text-red-500">
              {notesError.message}
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );
};

export default AddressForm;
