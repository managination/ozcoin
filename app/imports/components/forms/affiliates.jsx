export default (
    <div>
        <TextField
            id="ksEMail"
            ref="email"
            label="e-mail"
            placeholder="e-mail"
            className="md-cell md-cell-4"
            helpText={"the e-mail will be used to find the user. make sure to enter the same address as the one used for registration"}
            required
            defaultValue=""
            pattern="^[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,}$"
        />
        < TextField
            id="companyName"
            ref="companyName"
            label="Company Name"
            placeholder="Company Name"
            className="md-cell md-cell--4"
            required
            defaultValue=""
        />
        < TextField
            id="website"
            ref="website"
            label="Website"
            placeholder="Website"
            defaultValue=""
            className="md-cell md-cell--4"
            required
        />
        < TextField
            id="keystorePassword"
            ref="keystorePassword"
            label="Keystore Password"
            placeholder="Keystore Password"
            type="password"
            customSize="title"
            className="md-cell md-cell--12"
            required
        />
    </div>
)
/*

 Address1
 Address2
 City
 State
 Post Code
 Country
 Public key
 */
