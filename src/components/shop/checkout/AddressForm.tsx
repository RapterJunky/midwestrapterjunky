import type { UseFormRegister, FieldPath } from 'react-hook-form';
import type { CheckoutFormState } from '@/pages/shop/checkout';
import { capitlize } from '@/lib/utils/capitlize';

export type UseFormValues = FieldPath<CheckoutFormState>;

type Props = {
    register: UseFormRegister<CheckoutFormState>;
    disabled: boolean;
    ids: {
        name: UseFormValues,
        address1: UseFormValues,
        address2: UseFormValues,
        city: UseFormValues,
        country: UseFormValues,
        state: UseFormValues,
        postal: UseFormValues,
        phone: UseFormValues,
        notes?: UseFormValues
    }
    name: string;
}

const AddressForm: React.FC<Props> = ({ ids, name, disabled, register }) => {
    return (
        <>
            <div className='mb-4'>
                <h1 className="font-semibold mb-1 text-3xl">{capitlize(name)} Address</h1>
                <hr className='w-full' />
            </div>
            <div className='w-full mb-4'>
                <label htmlFor={`${name}-fullname`}>
                    <span className="text-gray-700">Full Name</span>
                </label>
                <input {...register(ids.name, { disabled, required: true, maxLength: 100 })} autoComplete="name" id={`${name}-fullname`} className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" type="text" placeholder='John Doe' />
            </div>
            <div>
                <div className="mb-4">
                    <label htmlFor={`${name}-address1`}>
                        <span className="text-gray-700">Address line 1 (or company name)</span>
                    </label>
                    <input {...register(ids.address1, { disabled, required: true })} autoComplete="address-line-1" id={`${name}-address1`} className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" type="text" placeholder='542 W. 15th Street' />
                </div>
                <div className="mb-4">
                    <label htmlFor={`${name}-address2`}>
                        <span className="text-gray-700">Address line 2 (optional)</span>
                    </label>
                    <input {...register(ids.address2)} autoComplete="address-line-2" id={`${name}-address2`} className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" type="text" placeholder='Apt. (optional)' />
                </div>
            </div>
            <div className="mb-4">
                <label htmlFor={`${name}-city`}>
                    <span className="text-gray-700">City:</span>
                </label>
                <input {...register(ids.city, { required: true, disabled })} autoComplete='city' id={`${name}-city`} className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" type="text" placeholder='city' />
            </div>
            <div className="flex gap-2">
                <div className="mb-4 w-full">
                    <label htmlFor={`${name}-country`}>
                        <span className="text-gray-700">Country or region</span>
                    </label>
                    <select defaultValue="US" {...register(ids.country, { required: true, disabled })} id={`${name}-country`} className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" autoComplete="country" placeholder='New York' enterKeyHint="done">
                        <option value="" disabled>Country</option>
                        <option value="AF">Afghanistan</option>
                        <option value="AX">Åland Islands</option>
                        <option value="AL">Albania</option>
                        <option value="DZ">Algeria</option>
                        <option value="AS">American Samoa</option>
                        <option value="AD">Andorra</option>
                        <option value="AO">Angola</option>
                        <option value="AI">Anguilla</option>
                        <option value="AQ">Antarctica</option>
                        <option value="AG">Antigua &amp; Barbuda</option>
                        <option value="AR">Argentina</option>
                        <option value="AM">Armenia</option>
                        <option value="AW">Aruba</option>
                        <option value="AC">Ascension Island</option>
                        <option value="AU">Australia</option>
                        <option value="AT">Austria</option>
                        <option value="AZ">Azerbaijan</option>
                        <option value="BS">Bahamas</option>
                        <option value="BH">Bahrain</option>
                        <option value="BD">Bangladesh</option>
                        <option value="BB">Barbados</option>
                        <option value="BY">Belarus</option>
                        <option value="BE">Belgium</option>
                        <option value="BZ">Belize</option>
                        <option value="BJ">Benin</option>
                        <option value="BM">Bermuda</option>
                        <option value="BT">Bhutan</option>
                        <option value="BO">Bolivia</option>
                        <option value="BA">Bosnia &amp; Herzegovina</option>
                        <option value="BW">Botswana</option>
                        <option value="BV">Bouvet Island</option>
                        <option value="BR">Brazil</option>
                        <option value="IO">British Indian Ocean Territory</option>
                        <option value="VG">British Virgin Islands</option>
                        <option value="BN">Brunei</option>
                        <option value="BG">Bulgaria</option>
                        <option value="BF">Burkina Faso</option>
                        <option value="BI">Burundi</option>
                        <option value="KH">Cambodia</option>
                        <option value="CM">Cameroon</option>
                        <option value="CA">Canada</option>
                        <option value="CV">Cape Verde</option>
                        <option value="BQ">Caribbean Netherlands</option>
                        <option value="KY">Cayman Islands</option>
                        <option value="CF">Central African Republic</option>
                        <option value="TD">Chad</option>
                        <option value="CL">Chile</option>
                        <option value="CN">China</option>
                        <option value="CX">Christmas Island</option>
                        <option value="CC">Cocos (Keeling) Islands</option>
                        <option value="CO">Colombia</option>
                        <option value="KM">Comoros</option>
                        <option value="CG">Congo - Brazzaville</option>
                        <option value="CD">Congo - Kinshasa</option>
                        <option value="CK">Cook Islands</option>
                        <option value="CR">Costa Rica</option>
                        <option value="CI">Côte d’Ivoire</option>
                        <option value="HR">Croatia</option>
                        <option value="CW">Curaçao</option>
                        <option value="CY">Cyprus</option>
                        <option value="CZ">Czechia</option>
                        <option value="DK">Denmark</option>
                        <option value="DJ">Djibouti</option>
                        <option value="DM">Dominica</option>
                        <option value="DO">Dominican Republic</option>
                        <option value="EC">Ecuador</option>
                        <option value="EG">Egypt</option>
                        <option value="SV">El Salvador</option>
                        <option value="GQ">Equatorial Guinea</option>
                        <option value="ER">Eritrea</option>
                        <option value="EE">Estonia</option>
                        <option value="SZ">Eswatini</option>
                        <option value="ET">Ethiopia</option>
                        <option value="FK">Falkland Islands (Islas Malvinas)</option>
                        <option value="FO">Faroe Islands</option>
                        <option value="FJ">Fiji</option>
                        <option value="FI">Finland</option>
                        <option value="FR">France</option>
                        <option value="GF">French Guiana</option>
                        <option value="PF">French Polynesia</option>
                        <option value="TF">French Southern Territories</option>
                        <option value="GA">Gabon</option>
                        <option value="GM">Gambia</option>
                        <option value="GE">Georgia</option>
                        <option value="DE">Germany</option>
                        <option value="GH">Ghana</option>
                        <option value="GI">Gibraltar</option>
                        <option value="GR">Greece</option>
                        <option value="GL">Greenland</option>
                        <option value="GD">Grenada</option>
                        <option value="GP">Guadeloupe</option>
                        <option value="GU">Guam</option>
                        <option value="GT">Guatemala</option>
                        <option value="GG">Guernsey</option>
                        <option value="GN">Guinea</option>
                        <option value="GW">Guinea-Bissau</option>
                        <option value="GY">Guyana</option>
                        <option value="HT">Haiti</option>
                        <option value="HM">Heard &amp; McDonald Islands</option>
                        <option value="HN">Honduras</option>
                        <option value="HK">Hong Kong</option>
                        <option value="HU">Hungary</option>
                        <option value="IS">Iceland</option>
                        <option value="IN">India</option>
                        <option value="ID">Indonesia</option>
                        <option value="IR">Iran</option>
                        <option value="IQ">Iraq</option>
                        <option value="IE">Ireland</option>
                        <option value="IM">Isle of Man</option>
                        <option value="IL">Israel</option>
                        <option value="IT">Italy</option>
                        <option value="JM">Jamaica</option>
                        <option value="JP">Japan</option>
                        <option value="JE">Jersey</option>
                        <option value="JO">Jordan</option>
                        <option value="KZ">Kazakhstan</option>
                        <option value="KE">Kenya</option>
                        <option value="KI">Kiribati</option>
                        <option value="XK">Kosovo</option>
                        <option value="KW">Kuwait</option>
                        <option value="KG">Kyrgyzstan</option>
                        <option value="LA">Laos</option>
                        <option value="LV">Latvia</option>
                        <option value="LB">Lebanon</option>
                        <option value="LS">Lesotho</option>
                        <option value="LR">Liberia</option>
                        <option value="LY">Libya</option>
                        <option value="LI">Liechtenstein</option>
                        <option value="LT">Lithuania</option>
                        <option value="LU">Luxembourg</option>
                        <option value="MO">Macao</option>
                        <option value="MG">Madagascar</option>
                        <option value="MW">Malawi</option>
                        <option value="MY">Malaysia</option>
                        <option value="MV">Maldives</option>
                        <option value="ML">Mali</option>
                        <option value="MT">Malta</option>
                        <option value="MH">Marshall Islands</option>
                        <option value="MQ">Martinique</option>
                        <option value="MR">Mauritania</option>
                        <option value="MU">Mauritius</option>
                        <option value="YT">Mayotte</option>
                        <option value="MX">Mexico</option>
                        <option value="FM">Micronesia</option>
                        <option value="MD">Moldova</option>
                        <option value="MC">Monaco</option>
                        <option value="MN">Mongolia</option>
                        <option value="ME">Montenegro</option>
                        <option value="MS">Montserrat</option>
                        <option value="MA">Morocco</option>
                        <option value="MZ">Mozambique</option>
                        <option value="MM">Myanmar (Burma)</option>
                        <option value="NA">Namibia</option>
                        <option value="NR">Nauru</option>
                        <option value="NP">Nepal</option>
                        <option value="NL">Netherlands</option>
                        <option value="NC">New Caledonia</option>
                        <option value="NZ">New Zealand</option>
                        <option value="NI">Nicaragua</option>
                        <option value="NE">Niger</option>
                        <option value="NG">Nigeria</option>
                        <option value="NU">Niue</option>
                        <option value="NF">Norfolk Island</option>
                        <option value="KP">North Korea</option>
                        <option value="MK">North Macedonia</option>
                        <option value="MP">Northern Mariana Islands</option>
                        <option value="NO">Norway</option>
                        <option value="OM">Oman</option>
                        <option value="PK">Pakistan</option>
                        <option value="PW">Palau</option>
                        <option value="PS">Palestine</option>
                        <option value="PA">Panama</option>
                        <option value="PG">Papua New Guinea</option>
                        <option value="PY">Paraguay</option>
                        <option value="PE">Peru</option>
                        <option value="PH">Philippines</option>
                        <option value="PN">Pitcairn Islands</option>
                        <option value="PL">Poland</option>
                        <option value="PT">Portugal</option>
                        <option value="PR">Puerto Rico</option>
                        <option value="QA">Qatar</option>
                        <option value="RE">Réunion</option>
                        <option value="RO">Romania</option>
                        <option value="RU">Russia</option>
                        <option value="RW">Rwanda</option>
                        <option value="WS">Samoa</option>
                        <option value="SM">San Marino</option>
                        <option value="ST">São Tomé &amp; Príncipe</option>
                        <option value="SA">Saudi Arabia</option>
                        <option value="SN">Senegal</option>
                        <option value="RS">Serbia</option>
                        <option value="SC">Seychelles</option>
                        <option value="SL">Sierra Leone</option>
                        <option value="SG">Singapore</option>
                        <option value="SX">Sint Maarten</option>
                        <option value="SK">Slovakia</option>
                        <option value="SI">Slovenia</option>
                        <option value="SB">Solomon Islands</option>
                        <option value="SO">Somalia</option>
                        <option value="ZA">South Africa</option>
                        <option value="GS">South Georgia &amp; South Sandwich Islands</option>
                        <option value="KR">South Korea</option>
                        <option value="SS">South Sudan</option>
                        <option value="ES">Spain</option>
                        <option value="LK">Sri Lanka</option>
                        <option value="BL">St Barthélemy</option>
                        <option value="SH">St Helena</option>
                        <option value="KN">St Kitts &amp; Nevis</option>
                        <option value="LC">St Lucia</option>
                        <option value="MF">St Martin</option>
                        <option value="PM">St Pierre &amp; Miquelon</option>
                        <option value="VC">St Vincent &amp; Grenadines</option>
                        <option value="SR">Suriname</option>
                        <option value="SJ">Svalbard &amp; Jan Mayen</option>
                        <option value="SE">Sweden</option>
                        <option value="CH">Switzerland</option>
                        <option value="TW">Taiwan</option>
                        <option value="TJ">Tajikistan</option>
                        <option value="TZ">Tanzania</option>
                        <option value="TH">Thailand</option>
                        <option value="TL">Timor-Leste</option>
                        <option value="TG">Togo</option>
                        <option value="TK">Tokelau</option>
                        <option value="TO">Tonga</option>
                        <option value="TT">Trinidad &amp; Tobago</option>
                        <option value="TA">Tristan da Cunha</option>
                        <option value="TN">Tunisia</option>
                        <option value="TR">Turkey</option>
                        <option value="TM">Turkmenistan</option>
                        <option value="TC">Turks &amp; Caicos Islands</option>
                        <option value="TV">Tuvalu</option>
                        <option value="UG">Uganda</option>
                        <option value="UA">Ukraine</option>
                        <option value="AE">United Arab Emirates</option>
                        <option value="GB">United Kingdom</option>
                        <option value="US">United States</option>
                        <option value="UY">Uruguay</option>
                        <option value="UM">US Outlying Islands</option>
                        <option value="VI">US Virgin Islands</option>
                        <option value="UZ">Uzbekistan</option>
                        <option value="VU">Vanuatu</option>
                        <option value="VA">Vatican City</option>
                        <option value="VE">Venezuela</option>
                        <option value="VN">Vietnam</option>
                        <option value="WF">Wallis &amp; Futuna</option>
                        <option value="EH">Western Sahara</option>
                        <option value="YE">Yemen</option>
                        <option value="ZM">Zambia</option>
                        <option value="ZW">Zimbabwe</option>
                    </select>
                </div>
                <div className="mb-4 w-full">
                    <label htmlFor={`${name}-state`}>
                        <span className="text-gray-700">State</span>
                    </label>
                    <select autoComplete="state" {...register(ids.state, { required: true, disabled })} id={`${name}-state`} className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                        <option value="" disabled>State</option>
                        <option value="AL" label="Alabama">Alabama</option>
                        <option value="AK" label="Alaska">Alaska</option>
                        <option value="AZ" label="Arizona">Arizona</option>
                        <option value="AR" label="Arkansas">Arkansas</option>
                        <option value="CA" label="California">California</option>
                        <option value="CO" label="Colorado">Colorado</option>
                        <option value="CT" label="Connecticut">Connecticut</option>
                        <option value="DE" label="Delaware">Delaware</option>
                        <option value="DC" label="District of Columbia">District of Columbia</option>
                        <option value="FL" label="Florida">Florida</option>
                        <option value="GA" label="Georgia">Georgia</option>
                        <option value="HI" label="Hawaii">Hawaii</option>
                        <option value="ID" label="Idaho">Idaho</option>
                        <option value="IL" label="Illinois">Illinois</option>
                        <option value="IN" label="Indiana">Indiana</option>
                        <option value="IA" label="Iowa">Iowa</option>
                        <option value="KS" label="Kansas">Kansas</option>
                        <option value="KY" label="Kentucky">Kentucky</option>
                        <option value="LA" label="Louisiana">Louisiana</option>
                        <option value="ME" label="Maine">Maine</option>
                        <option value="MD" label="Maryland">Maryland</option>
                        <option value="MA" label="Massachusetts">Massachusetts</option>
                        <option value="MI" label="Michigan">Michigan</option>
                        <option value="MN" label="Minnesota">Minnesota</option>
                        <option value="MS" label="Mississippi">Mississippi</option>
                        <option value="MO" label="Missouri">Missouri</option>
                        <option value="MT" label="Montana">Montana</option>
                        <option value="NE" label="Nebraska">Nebraska</option>
                        <option value="NV" label="Nevada">Nevada</option>
                        <option value="NH" label="New Hampshire">New Hampshire</option>
                        <option value="NJ" label="New Jersey">New Jersey</option>
                        <option value="NM" label="New Mexico">New Mexico</option>
                        <option value="NY" label="New York">New York</option>
                        <option value="NC" label="North Carolina">North Carolina</option>
                        <option value="ND" label="North Dakota">North Dakota</option>
                        <option value="OH" label="Ohio">Ohio</option>
                        <option value="OK" label="Oklahoma">Oklahoma</option>
                        <option value="OR" label="Oregon">Oregon</option>
                        <option value="PA" label="Pennsylvania">Pennsylvania</option>
                        <option value="RI" label="Rhode Island">Rhode Island</option>
                        <option value="SC" label="South Carolina">South Carolina</option>
                        <option value="SD" label="South Dakota">South Dakota</option>
                        <option value="TN" label="Tennessee">Tennessee</option>
                        <option value="TX" label="Texas">Texas</option>
                        <option value="UT" label="Utah">Utah</option>
                        <option value="VT" label="Vermont">Vermont</option>
                        <option value="VA" label="Virginia">Virginia</option>
                        <option value="WA" label="Washington">Washington</option>
                        <option value="WV" label="West Virginia">West Virginia</option>
                        <option value="WI" label="Wisconsin">Wisconsin</option>
                        <option value="WY" label="Wyoming">Wyoming</option>
                        <option value="AS" label="American Samoa">American Samoa</option>
                        <option value="AA" label="Armed Forces Americas">Armed Forces Americas</option>
                        <option value="AE" label="Armed Forces Europe">Armed Forces Europe</option>
                        <option value="AP" label="Armed Forces Pacific">Armed Forces Pacific</option>
                        <option value="FM" label="Federated States of Micronesia">Federated States of Micronesia</option>
                        <option value="GU" label="Guam">Guam</option>
                        <option value="MH" label="Marshall Islands">Marshall Islands</option>
                        <option value="MP" label="Northern Mariana Islands">Northern Mariana Islands</option>
                        <option value="PW" label="Palau">Palau</option>
                        <option value="PR" label="Puerto Rico">Puerto Rico</option>
                        <option value="VI" label="Virgin Islands">Virgin Islands</option>
                    </select>
                </div>
                <div className="mb-4 w-full">
                    <label htmlFor={`${name}-postal`}>
                        <span className="text-gray-700">Zip / Postal Code</span>
                    </label>
                    <input {...register(ids.postal, { disabled, maxLength: 20 })} autoComplete="postal-code" id={`${name}-postal`} className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" type="text" placeholder='10001' />
                </div>
            </div>
            <div className="mb-4">
                <label htmlFor={`${name}-phone`}>
                    <span className="text-gray-700">Phone</span>
                </label>
                <input inputMode="numeric" {...register(ids.phone, { disabled, required: true, pattern: /[\d \-\+]+/, maxLength: 30 })} autoComplete='tel' id={`${name}-phone`} type="tel" className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder='phone' />
            </div>
            {ids.notes ? (
                <div className="mb-4">
                    <label htmlFor={`${name}-comments`}>
                        <span className="text-gray-700">Comments</span>
                    </label>
                    <textarea {...register(ids.notes, { maxLength: 200 })} autoComplete='tel' id={`${name}-phone`} className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder='Comments (optonal)' />
                </div>
            ) : null}
        </>
    );
}

export default AddressForm;