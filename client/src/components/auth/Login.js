import React, { useState } from 'react'
import { Link, Redirect } from 'react-router-dom';
import { login } from '../../actions/auth'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'



const Login = ({ login, isAuthenticated }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { email, password } = formData;

    const onchange = e => setFormData({ ...formData, [e.target.name]: e.target.value })

    const onsubmit = async e => {
        e.preventDefault();
        login(email, password);
    }

    // redirect if authenticated
    if (isAuthenticated) {
        return <Redirect to='/dashboard' />
    }

    return (
        <React.Fragment>
            <h1 className="large text-primary">Sign In</h1>
            <p className="lead"><i className="fas fa-user"></i> Create Your Account</p>
            <form className="form" onSubmit={e => onsubmit(e)}>
                <div className="form-group">
                    <input type="email" placeholder="Email Address" value={email} onChange={e => onchange(e)} name="email" required />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        value={password}
                        onChange={e => onchange(e)}
                    />
                </div>
                <input type="submit" className="btn btn-primary" value="Login" />
            </form>
            <p className="my-1">
                Don't have an account?
                <Link to="/register">Sign Up</Link>
            </p>
        </React.Fragment>
    )
}

Login.propTypes = {
    login: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool,
}

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated
})


export default connect(mapStateToProps, { login })(Login);
