"use client";

import { User } from "@prisma/client";
import React from "react";
import { MdOutlineAdd } from "react-icons/md";

function HomeTitle({ currentUser }: { currentUser: User | null }) {
  const handleClickAddToken = () => {
    window.open(
      currentUser?.activeSubscription
        ? `${process.env.NEXT_PUBLIC_STRIPE_SUBCSCRIPTION_LINK}?prefilled_email=${currentUser?.email}`
        : `${process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}`,
      "_blank"
    );
  };

  return (
    <div className="flex justify-between font-semibold text-2xl sm:w-3/6">
      <div className="px-4 py-4 sm:px-4">Hello, {currentUser?.name}</div>
      <div className="flex row h-min justify-center py-4 px-4">
        <div className="flex justify-center items-center cursor-pointer">
          <a onClick={handleClickAddToken}>
            <MdOutlineAdd color="green" />
          </a>
        </div>
        &nbsp;
        <span>{`${currentUser?.token || 0} T`}</span>
      </div>
    </div>
  );
}

export default HomeTitle;
