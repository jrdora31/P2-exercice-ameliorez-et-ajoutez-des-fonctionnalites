package com.openclassrooms.etudiant.service;

import java.nio.charset.StandardCharsets;

import javax.crypto.SecretKey;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import java.util.Date;

@Service
public class JwtService {

    private static final String SECRET_KEY = "cle-secrete-minimale-pour-jwt-123";

    public String generateToken(UserDetails userDetails) {
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + 1000 * 60 * 60);

    return Jwts.builder()
            .subject(userDetails.getUsername())
            .signWith(getSigningKey())
            .issuedAt(now)
            .expiration(expirationDate)
            .compact();            
    }

    private SecretKey getSigningKey() {
    return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    private Claims extractAllClaims(String token) {
    return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public String extractUsername(String token) {
    return extractAllClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
    String username = extractUsername(token);
    return username != null
            && username.equals(userDetails.getUsername())
            && !isTokenExpired(token);
    }


    private boolean isTokenExpired(String token) {
    return extractAllClaims(token).getExpiration().before(new Date());
    }


}
